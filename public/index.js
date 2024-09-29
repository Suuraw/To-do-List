document.addEventListener("DOMContentLoaded", async () => {
    const loadItems = async () => {
        const response = await fetch("/items");
        const itemTable = await response.json();

        const unorderedList = document.querySelector(".item-list");
        unorderedList.innerHTML = ""; // Clear the list first to avoid duplicates
        itemTable.forEach((item) => {
            const new_item = document.createElement("li");
            new_item.innerHTML = `
                <input type="checkbox" data-id="${item.id}" ${item.completed ? "checked" : ""} />
                <label class="${item.completed ? 'strike' : ''}">${item.items}</label>`;
        
            
            unorderedList.appendChild(new_item);
        });

        // Re-add event listeners for checkboxes after loading items
        addCheckboxListeners();
    };

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
                    body: JSON.stringify({ completed }) // Send `completed` status
                });

                if (response.ok) {
                    const label = checkbox.nextElementSibling; // Select the label element
                    if (completed) {
                        label.classList.add('strike'); // Add the strike class if checked
                    }
                    else{
                        label.classList.remove('strike');
                        await loadItems();
                    }  // Remove the strike class if unchecked
                } else {
                    console.error('Error updating item status:', response.statusText);
                }
            });
        });
    };

    await loadItems();

    const form = document.getElementById("itemForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Prevents page reload

        const formData = new FormData(form);
        const itemText = formData.get("item");

        const response = await fetch("/items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ item: itemText }), // Ensure you're using the correct key
        });

        if (response.ok) {
            await loadItems(); // Reload the items after adding a new one
            form.reset(); // Clear the input field
        } else {
            console.error("Error:", response.statusText);
        }
    });
});
