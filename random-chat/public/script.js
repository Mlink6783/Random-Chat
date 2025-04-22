const socket = io();
const userInfo = JSON.parse(localStorage.getItem('userInfo'));

// Emit user info after connection
socket.emit('user-info', userInfo);

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const searchBtn = document.getElementById('searchBtn');
const partnerInfoDiv = document.getElementById('partnerInfo');
const sendImageBtn = document.getElementById('sendImageBtn');
const imageInput = document.getElementById('imageInput');

// Only emit 'start-search' when user clicks Next
searchBtn.addEventListener('click', () => {
  socket.emit('start-search');
  partnerInfoDiv.innerHTML = '<p class="text-gray-500">Searching for a partner...</p>';
  chatBox.innerHTML = '';
});

// On paired
socket.on('paired', (partnerInfo) => {
  partnerInfoDiv.innerHTML = `
    <img src="${partnerInfo.photo}" class="w-10 h-10 rounded-full border" />
    <div>
      <p class="font-semibold">${partnerInfo.name}</p>
      <p class="text-xs text-gray-500">${partnerInfo.age} years old, ${partnerInfo.sex}</p>
    </div>
  `;
});

// On receiving message
socket.on('message', (data) => {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('text-left');
  msgDiv.innerText = `${data.from}: ${data.msg}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// On receiving image
socket.on('image', (data) => {
  const img = document.createElement('img');
  img.src = data.image;
  img.classList.add('w-40', 'rounded-lg');
  const div = document.createElement('div');
  div.innerHTML = `<strong>${data.from}:</strong><br/>`;
  div.appendChild(img);
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

// On partner disconnected
socket.on('partner-disconnected', () => {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Partner disconnected. Click "Next" to find another one.`;
  chatBox.appendChild(msgDiv);
  partnerInfoDiv.innerHTML = '';
});

// Send message
sendBtn.addEventListener('click', () => {
  const msg = messageInput.value.trim();
  if (msg !== '') {
    socket.emit('message', msg);
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('text-right');
    msgDiv.textContent = `You: ${msg}`;
    chatBox.appendChild(msgDiv);
    messageInput.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

// Send image
sendImageBtn.addEventListener('click', () => {
  imageInput.click();
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageData = e.target.result;
    socket.emit('image', imageData);

    const img = document.createElement('img');
    img.src = imageData;
    img.classList.add('w-40', 'rounded-lg');
    const div = document.createElement('div');
    div.classList.add('text-right');
    div.innerHTML = `<strong>You:</strong><br/>`;
    div.appendChild(img);
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  };
  reader.readAsDataURL(file);
});
