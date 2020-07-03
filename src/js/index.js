const textsData = {
    primaryTextContent: "Victor Lozada.",
    aboutTextContent:
        "Hi!, i'm a self taught Javascript developer from Caracas, Venezuela, currently living in spain learning day by day how to become a better developer.",
    skillsTextContent: "Skills & learning",
    contactTextContent: "Say hi !",
    contactEmailTextContent: "‣ me@vict.dev",
    list: [
        {
            text: "Javascript",
            subList: ["Node.js", "Express", "Puppeteer", "React", "Webpack"],
        },
        {
            text: "Databases",
            subList: ["MySQL", "MongoDB"],
        },
        {
            text: "CSS",
            subList: ["Stylus", "Sass"],
        },
        {
            text: "Others",
            subList: ["Command line", "ReGex", "Git"],
        },
        {
            text: "Docker",
        },
    ],
};
class Writer {
    constructor({ delay, container, text, callBack = () => {} }) {
        this.delay = delay;
        this.container = container.nodeName
            ? container
            : document.querySelector(container);
        this.text = text;
        this.textMemory = this.memoryCreator(text);
        this.callBack = callBack;
        this.paused = false;
        this.completed = false;
    }

    *memoryCreator(text) {
        for (let i = 0; i < text.length; i++) {
            yield text[i];
        }
    }

    addTextToElement(text) {
        this.container.textContent += text;
    }

    waitForDelay() {
        return new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    finish(completed = false) {
        this.paused = true;
        this.completed = completed;
        return this.callBack(this.container);
    }

    togglePause = () => (this.paused = !this.paused);

    async play() {
        try {
            this.paused && this.togglePause();
            return await this.write();
        } catch (error) {
            throw error;
        }
    }

    stop() {
        this.togglePause();
    }

    async write() {
        try {
            if (this.completed) return;

            if (this.paused && !this.completed) return;

            if (!this.paused && !this.completed) {
                const currentChart = this.textMemory.next().value;
                if (!currentChart) return this.finish(true);
                await this.waitForDelay();
                this.addTextToElement(currentChart);
                return await this.write();
            }

            return this.finish(true);
        } catch (error) {
            throw error;
        }
    }
}
function createWriterList(list) {
    return list.map((item) => {
        let subListItems = { subListElement: null, subListWriters: [] };

        const liItem = document.createElement("li");
        liItem.classList.add("item");
        const liItemWriter = new Writer({
            delay: 100,
            container: liItem,
            text: item.text,
        });

        if (item.subList) {
            let subListWriters = [];

            const subListElement = document.createElement("ul");
            subListElement.classList.add("sublist");

            item.subList.forEach((subListItem) => {
                const subListItemElement = document.createElement("li");
                subListItemElement.classList.add("subitem");
                const writer = new Writer({
                    delay: 100,
                    container: subListItemElement,
                    text: subListItem,
                });
                subListWriters.push({ element: subListItemElement, writer });
            });

            subListItems.subListElement = subListElement;
            subListItems.subListWriters = subListWriters;
        }

        return {
            itemElement: liItem,
            itemWriter: liItemWriter,
            subList: subListItems,
        };
    });
}
function animateCSS(element, ...animateClasses) {
    return new Promise((resolve) => {
        const node = document.querySelector(element);
        node.addEventListener("animationend", resolve);
        node.classList.add(...animateClasses);
    });
}

(async () => {
    try {
        const {
            primaryTextContent,
            aboutTextContent,
            skillsTextContent,
            contactTextContent,
            contactEmailTextContent,
            list,
        } = textsData;
        const primaryBtn = document.querySelector("#primaryBtn");
        const listElement = document.querySelector("#list");

        const listWriters = createWriterList(list);

        const writers = [
            new Writer({
                delay: 1,
                container: "#primaryText",
                text: primaryTextContent,
                callBack: (container) => {
                    container.classList.remove("typebar");
                    primaryBtn.style.visibility = "visible";
                    primaryBtn.classList.add("animate__bounceIn");
                },
            }),
            new Writer({
                delay: 25,
                container: "#about",
                text: aboutTextContent,
                callBack: (container) => {},
            }),
            new Writer({
                delay: 100,
                container: "#skills",
                text: skillsTextContent,
            }),
            new Writer({
                delay: 100,
                container: "#contact",
                text: contactTextContent,
            }),
            new Writer({
                delay: 100,
                container: "#contactemail",
                text: contactEmailTextContent,
            }),
        ];

        const [
            primaryText,
            aboutText,
            skillsText,
            contactText,
            contactEmailText,
        ] = writers;

        async function startBox() {
            try {
                const box = document.querySelector("#box");
                const primary = document.querySelector("#primary");
                await animateCSS("#primary", "animate__backOutRight");
                primary.style.display = "none";
                box.style.display = "block";
                await Promise.all([
                    animateCSS("#box", "animate__bounceInDown"),
                    aboutText.play(),
                ]);

                await skillsText.play();

                await Promise.all(
                    listWriters.map(async (writer) => {
                        listElement.append(writer.itemElement);
                        return writer.itemWriter.play();
                    })
                );

                await Promise.all(
                    listWriters.map((writer) => {
                        if (writer.subList.subListElement) {
                            writer.itemElement.append(
                                writer.subList.subListElement
                            );
                            return Promise.all(
                                writer.subList.subListWriters.map(
                                    (subListWriter) => {
                                        writer.subList.subListElement.append(
                                            subListWriter.element
                                        );
                                        return subListWriter.writer.play();
                                    }
                                )
                            );
                        }
                        return;
                    })
                );
                await Promise.all([
                    contactText.play(),
                    contactEmailText.play(),
                ]);
            } catch (error) {
                throw error;
            }
        }

        primaryBtn.addEventListener("click", startBox);
        await primaryText.play();
    } catch (error) {
        console.log(error);
    }
})();
