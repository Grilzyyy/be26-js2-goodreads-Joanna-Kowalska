
const DATABASE_URL =
    "https://e-bookshelf-e8283-default-rtdb.europe-west1.firebasedatabase.app/";


const BOOKS_PATH = "/books";


function endpoint(path = "") {
    return `${DATABASE_URL}${BOOKS_PATH}${path}.json`;
}

export async function getBooks() {

    const response = await fetch(
        endpoint()
    );

    if (!response.ok) {
        throw new Error(
            "Could not load books from Firebase."
        );
    }

    return await response.json();
}


export async function addBook(bookData) {

    const response = await fetch(
        endpoint(),
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(bookData)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Could not add book to Firebase."
        );
    }

    return await response.json();
}



export async function updateBook(id, changes) {

    const response = await fetch(
        endpoint(`/${id}`),
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(changes)
        }
    );

    if (!response.ok) {
        throw new Error(
            "Could not update book."
        );
    }

    return await response.json();
}



export async function deleteBook(id) {

    const response = await fetch(
        endpoint(`/${id}`),
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error(
            "Could not delete book."
        );
    }
}