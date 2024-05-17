const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatSendButton = chat.querySelector(".chat__button");
const chatMessages = chat.querySelector(".chat__messages");
const loadImages = chat.querySelector(".load__image")

const imageModal = document.querySelector(".image__modal");
const imageLoaded = imageModal.querySelector(".image__loaded")
const sendImg = imageModal.querySelector(".send__img__button");
const cancelSendImg = imageModal.querySelector(".cancel__img__button");

const user = { id: "", name: "", color: "" };

const selfSound = new Audio('./sounds/self-sound.mp3');
const otherSound = new Audio('./sounds/other-sound.mp3');
const serverSound = new Audio('./sounds/server-sound.mp3');

let websocket;
var isYou = true;

const createMessageSelfElement = (content) => {
    const div = document.createElement("div");
    const container = document.createElement("div");
    const time = document.createElement("span");
    div.classList.add("message__self")
    time.classList.add("time__self");
    div.appendChild(container);
    div.appendChild(time);

    const now = new Date();
    container.innerHTML = content;
    time.innerText = (now.getHours() + ":" + now.getMinutes());
    selfSound.volume = 0.5;
    selfSound.play();
    return div;
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const container = document.createElement("div");
    const span = document.createElement("span");
    const time = document.createElement("span");
    div.classList.add("message__other");
    time.classList.add("time__other");
    span.classList.add("message__sender");
    span.style.color = senderColor;

    div.appendChild(span);
    div.appendChild(container)
    div.appendChild(time);

    const now = new Date();
    time.innerText = (now.getHours() + ":" + now.getMinutes());
    span.innerText = sender;
    container.innerHTML += content;

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

    let message = null

    if (userColor != null) {
        message = userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor);
    } else {
        userId == user.id ? message = createMessageServer("você" + content)
            : message = createMessageServer(userName + "" + content);
    }
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

    websocket = new WebSocket("wss://simple-chat-api-2tka.onrender.com");
    //Para testes na sua máquina utilize: "ws://localhost:8080"
    //websocket = new WebSocket("ws://localhost:8080");

    websocket.onmessage = processMessage;

    setTimeout(() => {
        userLogin()
    }, "1000");
}

function userLogin() {
    const message = { userId: user.id, userName: user.name, content: ` entrou na conversa.` };
    websocket.send(JSON.stringify(message))
}

const createMessageServer = (content) => {
    const div = document.createElement("div")
    const span = document.createElement("span");
    div.classList.add("message__server")
    div.appendChild(span);
    span.innerText = content;
    serverSound.volume = 0.5;
    serverSound.play();
    return div;
}

const sendMessage = (event) => {
    event.preventDefault();
    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value.replace("<", '&lt;')
    };

    websocket.send(JSON.stringify(message))
    chatInput.value = "";
}

const loadImage = (event) => {
    imageModal.style.display = "flex";
    chatInput.disabled = true;
    loadImages.disabled = true;
    chatSendButton.disabled = true;

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
        content: `<img src="${imageLoaded.src}" width="230px" alt="img">`
    };

    websocket.send(JSON.stringify(message))
    chatInput.disabled = false;
    loadImages.disabled = false;
    chatSendButton.disabled = false;
}

const cancelSendImage = () => {
    chatInput.disabled = false;
    loadImages.disabled = false;
    chatSendButton.disabled = false;
    imageModal.style.display = 'none';
    imageLoaded.src = "";
}

loginForm.addEventListener("submit", handleLogin);
chatForm.addEventListener("submit", sendMessage);
loadImages.addEventListener("change", loadImage);
cancelSendImg.addEventListener("click", cancelSendImage);
//Devido a limitações do modo free do Render não é possível o envio de imagens, porém no servidor local para enviar imagens, basta descomentar a linha abaixo:
//sendImg.addEventListener("click", sendImage);