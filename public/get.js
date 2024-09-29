const loadItems=async()=>
{
    try {
        
        const response = await fetch("/items");
        const items = await response.json();
      
        const unorderedList = document.querySelector(".item-list");
        items.forEach((item) => {
        const new_item = document.createElement("li");
          new_item.innerHTML = `
                  <input type="checkbox" data-id="${item.id}" ${
            item.completed ? "checked" : ""
          } />
                  <label>${item.items}</label>`;
          unorderedList.appendChild(new_item);
          return unorderedList;
        });
    } catch (error) {
        console.log("Not fetched")
    }
}
export default loadItems;