document.addEventListener("DOMContentLoaded", async () => {
    const response = await fetch("/items");
    const items = await response.json();
  
    const unorderedList = document.querySelector('.item-list');
    items.forEach(item => {
      const new_item = document.createElement('li');
      new_item.innerHTML = `<input type="checkbox" /><label>${item.items}</label>`; // Ensure you're using the correct field from the database
      unorderedList.appendChild(new_item);
    });
  });
  
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
      newItem.innerHTML = `<input type="checkbox" /><label>${result.item}</label>`; // Use item from response
      unorderedList.appendChild(newItem); // Add new item to the list
      form.reset(); // Clear the input field
    } else {
      console.error('Error:', response.statusText);
    }
  });
  