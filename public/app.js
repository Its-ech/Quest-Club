const btn = document.getElementById('btnLoad');
const output = document.getElementById('output');

btn.addEventListener('click', async () => {
  output.textContent = 'Loading...';

  const res = await fetch('/api/v1/quests/today');
  const data = await res.json();

  output.textContent = JSON.stringify(data, null, 2);
});
