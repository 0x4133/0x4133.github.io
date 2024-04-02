import os


def update_article(article_number):
    title = input(f"Enter the title for article {article_number}: ")
    content = input(f"Enter the content for article {article_number}: ")
    image_path = input(f"Enter the path to the image for article {article_number}: ")

    with open("index.html", "r") as file:
        html_content = file.read()

    # Find the position of the article to update
    article_start = html_content.find(f"<article>", article_number - 1)
    article_end = html_content.find("</article>", article_start)

    # Extract the existing article HTML
    existing_article_html = html_content[
        article_start : article_end + len("</article>")
    ]

    # Create the updated article HTML
    updated_article_html = f"""
    <article data-image="{image_path}">
        <h3>{title}</h3>
        <p>{content}</p>
        <a href="#" class="read-more-btn" data-article="{article_number}">Read More</a>
    </article>
    """

    # Replace the existing article HTML with the updated HTML
    updated_html_content = html_content.replace(
        existing_article_html, updated_article_html
    )

    with open("index.html", "w") as file:
        file.write(updated_html_content)

    print(f"Article {article_number} updated successfully!")


def main():
    while True:
        print("\n--- Hacker's Blog Article Management ---")
        print("1. Update Article 1")
        print("2. Update Article 2")
        print("3. Update Article 3")
        print("4. Exit")

        choice = input("Enter your choice (1-4): ")

        if choice == "1":
            update_article(1)
        elif choice == "2":
            update_article(2)
        elif choice == "3":
            update_article(3)
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print("Invalid choice. Please try again.")


if __name__ == "__main__":
    main()

    # ... (existing code remains the same)
