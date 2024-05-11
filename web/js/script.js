const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");
const loadImages = chat.querySelector(".load__image")

const imageModal = document.querySelector(".image__modal");
const imageLoaded = imageModal.querySelector(".image__loaded")
const sendImg = imageModal.querySelector(".send__img__button");


const user = { id: "", name: "", color: "" };

const selfSound = new Audio('./sounds/self-sound.mp3');
const otherSound = new Audio('./sounds/other-sound.mp3');


let websocket;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")
    div.classList.add("message__self")
    div.innerHTML = content;
    selfSound.volume = 0.5;
    selfSound.play();
    return div;
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const span = document.createElement("span");
    div.classList.add("message__other");
    span.classList.add("message__sender");
    span.style.color = senderColor;

    div.appendChild(span);

    span.innerHTML = sender;
    div.innerHTML += content;

    otherSound.volume = 0.5;
    otherSound.play();

    return div;

}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data);

    const message = userId == user.id
        ? createMessageSelfElement(content)
        : createMessageOtherElement(content, userName, userColor);

    chatMessages.appendChild(message);
    scrollScreen();
}
const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    websocket = new WebSocket("wss://simple-chat-api-1131.onrender.com");
    //tests
    //websocket = new WebSocket("ws://localhost:8080");
    websocket.onmessage = processMessage;
}

const sendMessage = (event) => {
    event.preventDefault();
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    websocket.send(JSON.stringify(message))
    chatInput.value = "";
}

const loadImage = (event) => {
    imageModal.style.display = "flex";
    if (!(event.target && event.target.files && event.target.files.length > 0)) {
        return;
    }

    var r = new FileReader();
    r.onload = function () {
        imageLoaded.src = r.result;
    }
    r.readAsDataURL(event.target.files[0]);
}

const sendImage = () => {
    imageModal.style.display = "none";
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: `<img src="${imageLoaded.src}" height="200px" alt="img">`
    };

    websocket.send(JSON.stringify(message))
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
loadImages.addEventListener("change", loadImage);
sendImg.addEventListener("click", sendImage);