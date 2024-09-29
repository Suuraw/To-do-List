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
                <input type="checkbox" />
                <label id="item-${item.id}">${item.items}</label> <!-- Add the id to the label -->
                <span class="edit-btn">✏️</span>`;
            unorderedList.appendChild(newItem);
        });
        
        attachEditButtonListeners(); // Attach listeners after loading items
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

    await loadItems(); // Initial load of items

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
            const result = await response.json(); // Get the JSON response
            const unorderedList = document.querySelector('.item-list');
            const newItem = document.createElement('li');
            newItem.setAttribute('data-id', result.id); // Set the new item's id
            newItem.innerHTML = `
                <input type="checkbox" />
                <label id="item-${result.id}">${result.item}</label> <!-- Add the id to the label -->
                <span class="edit-btn">✏️</span>`; // Use item from response
            unorderedList.appendChild(newItem); // Add new item to the list
            form.reset(); // Clear the input field
            window.location.reload();
            // Reattach event listeners for the newly added item
            attachEditButtonListeners();
        } else {
            console.error('Error:', response.statusText);
        }
    });
});
