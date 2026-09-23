export class Book {

    #id;
    #title;
    #author;
    #isRead;
    #score;
    #category;
    #description;
    #image;
    #comment;

    constructor(data) {
        this.#id = data.id;

        this.#title = data.title ?? "";
        this.#author = data.author ?? "";

        this.#isRead = Boolean(data.isRead);

        this.#score =
            typeof data.score === "number"
                ? data.score
                : undefined;

        this.#category =
            data.category ?? "Other";

        this.#description =
            data.description ?? "";

        this.#image =
            data.image ?? "";

        this.#comment =
            data.comment ?? "";
    }


    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    get author() {
        return this.#author;
    }

    get isRead() {
        return this.#isRead;
    }

    get score() {
        return this.#score;
    }

    get category() {
        return this.#category;
    }

    get description() {
        return this.#description;
    }

    get image() {
        return this.#image;
    }

    get comment() {
        return this.#comment;
    }


    toggleRead() {

        this.#isRead = !this.#isRead;

        if (!this.#isRead) {
            this.#score = undefined;
        }
    }


    setScore(score) {

        if (!this.#isRead) {
            throw new Error(
                "A book must be read before it can be rated."
            );
        }

        if (!Number.isInteger(score) || score < 1 || score > 5) {
            throw new Error(
                "Score must be between 1 and 5."
            );
        }

        this.#score = score;
    }


    setComment(comment) {
        this.#comment = comment;
    }


    toJSON() {

        const result = {
            title: this.#title,
            author: this.#author,
            isRead: this.#isRead,
            category: this.#category,
            description: this.#description,
            image: this.#image,
            comment: this.#comment
        };

        if (this.#score !== undefined) {
            result.score = this.#score;
        }

        return result;
    }
}