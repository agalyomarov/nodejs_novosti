document.addEventListener("DOMContentLoaded", function() {
    const elems = document.querySelectorAll("select");
    const options = document.querySelectorAll("select option");
    let instances = M.FormSelect.init(elems, options);
});
M.Tabs.init(document.querySelectorAll(".tabs"));

const deleteCategory = document.querySelector("table.categories");
if (deleteCategory) {
    deleteCategory.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-category")) {
            const check = prompt("Удалить категории.Посты тоже будет удалятся(y/n):");
            if (check == "y") {
                fetch(`/admin/category/${event.target.dataset.id}`, {
                        method: "DELETE",
                        headers: {
                            "X-CSRF-TOKEN": event.target.dataset.csrf,
                        },
                    })
                    .then((res) => {
                        return res.json();
                    })
                    .then((data) => {
                        if (data.status == "ok") {
                            window.location.reload();
                        }
                    });
            }
        }
    });
}

const posts = document.querySelector("div.posts");
if (posts) {
    posts.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-post")) {
            const adminCheck = prompt("Удалить пост?(y/n)");
            if (adminCheck == "y") {
                event.target.closest("form.form-delete-post").submit();
            }
        }
    });
}