const fs = require('fs');
const path = require('path');
class Store {
    constructor(){
        // Check if the file exists
        const filePath = path.join(__dirname, 'store.json');
        if (!fs.existsSync(filePath)) {
            // If it doesn't exist, create an empty file
            fs.writeFileSync(filePath, JSON.stringify({}));
        }
        // Read the file and parse the JSON data
        const data = fs.readFileSync(filePath, 'utf8');
        this.store = JSON.parse(data);
    }
    // Method to get the value associated with a key
    get(key) {
        return this.store[key] || null; // Return the value or null if not found
    }
    // get onject by value
    getByValue(value) {
        return Object.keys(this.store).find(key => this.store[key] === value); // Return the key associated with the value
    }
    getById(value) {
        return Object.keys(this.store).find(key => this.store[key].id === value); // Return the key associated with the id
    }
    // Method to set a key-value pair in the store
    set(key, value) {
        this.store[key] = value; // Set the key-value pair
        this.save(); // Save the updated store to the file
    }
    // Method to remove a key from the store
    remove(key) {
        delete this.store[key]; // Delete the key from the store
        this.save(); // Save the updated store to the file
    }
    // Method to save the store to the file
    save() {
        const filePath = path.join(__dirname, 'store.json');
        fs.writeFileSync(filePath, JSON.stringify(this.store, null, 2)); // Write the store to the file
    }
    // Method to clear the store
    clear() {
        this.store = {}; // Clear the store
        this.save(); // Save the cleared store to the file
    }
    // Method to get all keys in the store
    getAllKeys() {
        return Object.keys(this.store); // Return all keys in the store
    }
    // Method to get all values in the store
    getAllValues() {
        return Object.values(this.store); // Return all values in the store
    }
    // check if the key exists in the store
    has(key) {
        return this.store.hasOwnProperty(key); // Check if the key exists in the store
    }
    // create a ttore array
    createStoreArray() {
        return Object.entries(this.store).map(([key, value]) => ({ key, value })); // Convert the store to an array of objects
    }
    // add onject to array
    add(key, value) {
        this.store[key].push(value) // Add the object to the store
        this.save(); // Save the updated store to the file
    }

}

module.exports = Store; // Export the Store class for use in other modules