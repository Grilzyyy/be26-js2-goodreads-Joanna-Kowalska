import { Book } from "./Book.js";

import {
    getBooks,
    addBook,
    updateBook,
    deleteBook
} from "./firebase.js";



let books = [];

let currentBook = null;



const booksContainer =
    document.querySelector("#books-container");

const searchInput =
    document.querySelector("#search-input");

const categoryFilter =
    document.querySelector("#category-filter");

const showAllButton =
    document.querySelector("#show-all-button");

const addBookButton =
    document.querySelector("#add-book-button");

const addModal =
    document.querySelector("#add-modal");

const detailsModal =
    document.querySelector("#details-modal");

const closeAdd =
    document.querySelector("#close-add");

const closeDetails =
    document.querySelector("#close-details");

const addBookForm =
    document.querySelector("#add-book-form");



async function loadBooks() {

    booksContainer.innerHTML = `
        <p class="no-books">
            Loading books...
        </p>
    `;

    try {

        const data = await getBooks();

        books = [];


        if (data) {

            Object.entries(data).forEach(
                ([id, bookData]) => {

                    books.push(
                        new Book({
                            id,
                            ...bookData
                        })
                    );
                }
            );
        }


        updateCategories();

        renderBooks();

    } catch (error) {

        console.error(error);

        booksContainer.innerHTML = `
            <p class="no-books">
                Could not load books.<br><br>
                Check your Firebase URL and database rules.
            </p>
        `;
    }
}


function renderBooks() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const category =
        categoryFilter.value;


    const filteredBooks =
        books.filter(book => {

            const matchesSearch =
                book.title
                    .toLowerCase()
                    .includes(search)

                ||

                book.author
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =
                category === "all"
                ||
                book.category === category;


            return (
                matchesSearch &&
                matchesCategory
            );
        });


    booksContainer.innerHTML = "";


    if (filteredBooks.length === 0) {

        booksContainer.innerHTML = `
            <p class="no-books">
                No books found.
            </p>
        `;

        return;
    }


    filteredBooks.forEach(book => {

        const card =
            document.createElement("article");

        card.className = "book-card";


        const image =
            book.image ||
            "/assets/Book.png";


        const scoreHTML =
            book.score
                ? `
                    <div class="score">
                        ${"★".repeat(book.score)}
                        ${"☆".repeat(5 - book.score)}
                    </div>
                `
                : "";


        card.innerHTML = `

            <img
                class="book-cover"
                src="${escapeHTML(image)}"
                alt="${escapeHTML(book.title)}"
                onerror="this.src='/assets/Book.png'"
            >

            <div class="book-info">

                <h3>
                    ${escapeHTML(book.title)}
                </h3>

                <p class="author">
                    ${escapeHTML(book.author)}
                </p>

                <span class="category">
                    ${escapeHTML(book.category)}
                </span>

                <p class="read-status">
                    ${
                        book.isRead
                            ? "📖 Read"
                            : "📕 Not read"
                    }
                </p>

                ${scoreHTML}

            </div>
        `;


        card.addEventListener(
            "click",
            () => openDetails(book.id)
        );


        booksContainer.appendChild(card);
    });
}



function updateCategories() {

    const selected =
        categoryFilter.value;


    const categories =
        [...new Set(
            books.map(
                book => book.category
            )
        )].sort();


    categoryFilter.innerHTML = `
        <option value="all">
            All categories
        </option>
    `;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent = category;

        categoryFilter.appendChild(option);
    });


    if (categories.includes(selected)) {
        categoryFilter.value = selected;
    }
}



function openDetails(id) {

    currentBook =
        books.find(
            book => book.id === id
        );


    if (!currentBook) {
        return;
    }


    saveClickHistory(currentBook);


    renderDetails();

    detailsModal.classList.remove(
        "hidden"
    );
}


function renderDetails() {

    if (!currentBook) {
        return;
    }


    const container =
        document.querySelector(
            "#details-content"
        );


    const image =
        currentBook.image ||
        "/assets/Book.png";


    const stars =
        [1, 2, 3, 4, 5]
            .map(number => {

                const active =
                    currentBook.score >= number
                        ? "active"
                        : "";


                return `
                    <button
                        class="star ${active}"
                        data-score="${number}"
                        ${
                            !currentBook.isRead
                                ? "disabled"
                                : ""
                        }
                    >
                        ★
                    </button>
                `;
            })
            .join("");


    container.innerHTML = `

        <div class="details-layout">

            <div>

                <img
                    class="details-cover"
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(currentBook.title)}"
                    onerror="this.src='/assets/Book.png'"
                >

            </div>


            <div class="details-info">

                <h2>
                    ${escapeHTML(currentBook.title)}
                </h2>

                <h3>
                    by ${escapeHTML(currentBook.author)}
                </h3>

                <span class="category">
                    ${escapeHTML(currentBook.category)}
                </span>


                <p class="description">
                    ${
                        escapeHTML(
                            currentBook.description ||
                            "No description available."
                        )
                    }
                </p>


                <p class="read-status">

                    ${
                        currentBook.isRead
                            ? "📖 This book has been read."
                            : "📕 This book has not been read."
                    }

                </p>


                <button
                    id="toggle-read"
                    class="read-button"
                >
                    ${
                        currentBook.isRead
                            ? "Mark as unread"
                            : "Mark as read"
                    }
                </button>


                <div class="rating">

                    <strong>
                        ${
                            currentBook.isRead
                                ? "Rate this book"
                                : "Read the book before rating it"
                        }
                    </strong>

                    <div class="stars">
                        ${stars}
                    </div>

                </div>


                <div class="comment-section">

                    <strong>
                        Comment
                    </strong>

                    <textarea
                        id="comment-input"
                        rows="5"
                        placeholder="Write your thoughts..."
                    >${escapeHTML(
                        currentBook.comment
                    )}</textarea>


                    <div class="action-row">

                        <button
                            id="save-comment"
                            class="save-button"
                        >
                            Save comment
                        </button>

                        <button
                            id="delete-book"
                            class="delete-button"
                        >
                            Delete book
                        </button>

                    </div>

                </div>

            </div>

        </div>
    `;


    document
        .querySelector("#toggle-read")
        .addEventListener(
            "click",
            toggleRead
        );


    document
        .querySelectorAll(".star")
        .forEach(star => {

            star.addEventListener(
                "click",
                () => {

                    const score =
                        Number(
                            star.dataset.score
                        );

                    rateBook(score);
                }
            );
        });


    document
        .querySelector("#save-comment")
        .addEventListener(
            "click",
            saveComment
        );


    document
        .querySelector("#delete-book")
        .addEventListener(
            "click",
            removeBook
        );
}



async function toggleRead() {

    if (!currentBook) {
        return;
    }


    const newReadState =
        !currentBook.isRead;


    try {

        currentBook.toggleRead();


        if (newReadState) {

            await updateBook(
                currentBook.id,
                {
                    isRead: true
                }
            );

        } else {

            await updateBook(
                currentBook.id,
                {
                    isRead: false,

                    score: null
                }
            );
        }


        renderDetails();

        renderBooks();

    } catch (error) {

        console.error(error);

        alert(
            "Could not update the book."
        );
    }
}



async function rateBook(score) {

    if (
        !currentBook ||
        !currentBook.isRead
    ) {
        return;
    }


    try {

        currentBook.setScore(score);


        await updateBook(
            currentBook.id,
            {
                score: score
            }
        );


        renderDetails();

        renderBooks();

    } catch (error) {

        console.error(error);

        alert(
            "Could not save the rating."
        );
    }
}



async function saveComment() {

    if (!currentBook) {
        return;
    }


    const commentInput =
        document.querySelector(
            "#comment-input"
        );


    try {

        currentBook.setComment(
            commentInput.value.trim()
        );


        await updateBook(
            currentBook.id,
            {
                comment:
                    currentBook.comment
            }
        );


        alert("Comment saved!");

    } catch (error) {

        console.error(error);

        alert(
            "Could not save the comment."
        );
    }
}



async function removeBook() {

    if (!currentBook) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${currentBook.title}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteBook(
            currentBook.id
        );


        books =
            books.filter(
                book =>
                    book.id !== currentBook.id
            );


        currentBook = null;


        detailsModal.classList.add(
            "hidden"
        );


        updateCategories();

        renderBooks();

    } catch (error) {

        console.error(error);

        alert(
            "Could not delete the book."
        );
    }
}


addBookForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const title =
            document
                .querySelector("#book-title")
                .value
                .trim();


        const author =
            document
                .querySelector("#book-author")
                .value
                .trim();


        const category =
            document
                .querySelector("#book-category")
                .value
                .trim()
                || "Other";


        const description =
            document
                .querySelector("#book-description")
                .value
                .trim();


        const image =
            document
                .querySelector("#book-image")
                .value
                .trim();


        if (!title || !author) {

            alert(
                "Title and author are required."
            );

            return;
        }


        const bookData = {

            title,

            author,

            category,

            description,

            image,

            isRead: false,

            comment: ""
        };


        try {

            const result =
                await addBook(
                    bookData
                );


            const newBook =
                new Book({
                    id: result.name,
                    ...bookData
                });


            books.push(newBook);


            addBookForm.reset();


            addModal.classList.add(
                "hidden"
            );


            updateCategories();

            renderBooks();

        } catch (error) {

            console.error(error);

            alert(
                "Could not add the book."
            );
        }
    }
);



searchInput.addEventListener(
    "input",
    renderBooks
);


categoryFilter.addEventListener(
    "change",
    renderBooks
);


showAllButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        categoryFilter.value = "all";

        renderBooks();
    }
);


addBookButton.addEventListener(
    "click",
    () => {

        addModal.classList.remove(
            "hidden"
        );
    }
);


closeAdd.addEventListener(
    "click",
    () => {

        addModal.classList.add(
            "hidden"
        );
    }
);


closeDetails.addEventListener(
    "click",
    () => {

        detailsModal.classList.add(
            "hidden"
        );
    }
);


addModal.addEventListener(
    "click",
    event => {

        if (event.target === addModal) {

            addModal.classList.add(
                "hidden"
            );
        }
    }
);


detailsModal.addEventListener(
    "click",
    event => {

        if (
            event.target === detailsModal
        ) {

            detailsModal.classList.add(
                "hidden"
            );
        }
    }
);


function saveClickHistory(book) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "bookClickHistory"
            )
        ) || [];


    const filtered =
        history.filter(
            id => id !== book.id
        );


    filtered.unshift(
        book.id
    );


    localStorage.setItem(
        "bookClickHistory",
        JSON.stringify(
            filtered.slice(0, 20)
        )
    );
}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}



loadBooks();
