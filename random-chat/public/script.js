const socket = io();
const userInfo = JSON.parse(localStorage.getItem('userInfo'));
socket.emit('user-info', userInfo);

document.getElementById('searchBtn').addEventListener('click', () => {
  socket.emit('start-search');
});

socket.on('paired', (partnerInfo) => {
  document.getElementById('partnerInfo').innerText =
    `Connected with ${partnerInfo.name}, ${partnerInfo.age} (${partnerInfo.sex})`;
});

socket.on('message', (data) => {
  const chatBox = document.getElementById('chatBox');
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${data.from}: ${data.msg}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on('partner-disconnected', () => {
  const chatBox = document.getElementById('chatBox');
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `Partner disconnected. Click "Start Searching" to chat with someone else.`;
  chatBox.appendChild(msgDiv);
});

document.getElementById('sendBtn').addEventListener('click', () => {
  const input = document.getElementById('messageInput');
  if (input.value.trim() !== '') {
    socket.emit('message', input.value.trim());
    const chatBox = document.getElementById('chatBox');
    const msgDiv = document.createElement('div');
    msgDiv.textContent = `You: ${input.value}`;
    chatBox.appendChild(msgDiv);
    input.value = '';
  }
});
