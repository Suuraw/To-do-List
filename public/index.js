document.addEventListener("DOMContentLoaded", async () => {
    // Load items from the server
    const loadItems = async () => {
        const response = await fetch("/items");
        const items = await response.json();

        const unorderedList = document.querySelector('.item-list');
        unorderedList.innerHTML = ''; // Clear existing items

        items.forEach(item => {
            const newItem = document.createElement('li');
            newItem.setAttribute('data-id', item.id); // Set the data-id to the item's id

            newItem.innerHTML = `
                <input type="checkbox" data-id="${item.id}" ${item.completed ? "checked" : ""} />
                <label class="${item.completed ? 'strike' : ''}" id="item-${item.id}">${item.items}</label>
                <span class="edit-btn">✏️</span>`;
                
            unorderedList.appendChild(newItem);
        });

        // Re-add event listeners for checkboxes and edit buttons after loading items
        addCheckboxListeners();
        attachEditButtonListeners();
        deleteSelectedItems(); // Ensure delete functionality is set up
    };

    // Attach event listeners to checkboxes 
    const addCheckboxListeners = () => {
        const checkboxes = document.querySelectorAll('.item-list input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', async () => {
                const id = checkbox.getAttribute('data-id');
                const completed = checkbox.checked;

                // Fetch request to update the status of the checkbox
                const response = await fetch(`/items/${id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ completed })
                });

                if (response.ok) {
                    const label = checkbox.nextElementSibling; // Select the label element
                    if (completed) {
                        label.classList.add('strike'); // Add the strike class if checked
                    } else {
                        label.classList.remove('strike'); // Remove the strike class if unchecked
                    }
                } else {
                    console.error('Error updating item status:', response.statusText);
                }
            });
        });
    };

    // Attach event listeners to edit buttons
    const attachEditButtonListeners = () => {
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const label = button.previousElementSibling; // Get the label
                const input = document.createElement('input'); // Create input field
                input.type = 'text';
                input.value = label.innerText; // Set input value to the label text

                label.replaceWith(input); // Replace label with input
                input.focus(); // Focus on the input field

                // Save changes when the user presses 'Enter' or clicks outside
                const saveChanges = async () => {
                    const updatedLabel = document.createElement('label');
                    updatedLabel.id = label.id; // Keep the same id
                    updatedLabel.innerText = input.value; // Update label with new text
                    const listItem = button.parentNode; // Get the <li> element
                    const itemId = listItem.getAttribute('data-id'); // Get item id

                    // Send updated data to the server
                    const response = await fetch(`/update/${itemId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ item: input.value })
                    });

                    if (response.ok) {
                        input.replaceWith(updatedLabel); // Replace input with updated label
                        await loadItems(); // Reload items after updating
                    } else {
                        console.error('Error updating item:', response.statusText);
                    }
                };

                // Listen for 'Enter' key to save changes
                input.addEventListener('keydown', async (e) => {
                    if (e.key === 'Enter') {
                        await saveChanges();
                    }
                });

                // Save changes on blur (when the input loses focus)
                input.addEventListener('blur', saveChanges);
            });
        });
    };

    // Handle form submission
    const form = document.getElementById('itemForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevents page reload

        const formData = new FormData(form);
        const itemText = formData.get('item');

        const response = await fetch('/items', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ item: itemText }) // Ensure you're using the correct key
        });

        if (response.ok) {
            await loadItems(); // Reload the items after adding a new one
            form.reset(); // Clear the input field
        } else {
            console.error('Error:', response.statusText);
        }
    });

    const deleteSelectedItems = () => {
        const deleteBtn = document.getElementById('delete-btn');

        deleteBtn.addEventListener('click', async () => {
            // Collect the IDs of checked items
            const selectedItems = document.querySelectorAll('.item-list input[type="checkbox"]:checked');
            const idsToDelete = Array.from(selectedItems).map(checkbox => checkbox.getAttribute('data-id'));

            // Check if there are any items selected for deletion
            if (idsToDelete.length === 0) {
                alert("No items selected for deletion.");
                return;
            }

            try {
                const response = await fetch('/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ ids: idsToDelete }) // Send the selected item IDs
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                await loadItems(); // Reload items after deletion
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        });
    };

    await loadItems(); // Initial load of items
});
