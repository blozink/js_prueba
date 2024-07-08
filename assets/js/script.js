document.addEventListener('DOMContentLoaded', function() {
    const chartCanvas = document.getElementById('chart').getContext('2d');
    window.myChart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            labels: Array.from({length: 10}, (_, i) => `Día ${i + 1}`),
            datasets: [{
                label: 'Historial últimos 10 días',
                data: Array(10).fill(0),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Fecha'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Valor'
                    }
                }
            }
        }
    });
});

document.getElementById('conversion-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const amount = document.getElementById('amount').value;
    const currency = document.getElementById('currency').value;
    const resultDiv = document.getElementById('result');
    const chartCanvas = document.getElementById('chart');
    resultDiv.textContent = '...';

    try {
        console.log('Fetching exchange rates...');
        const response = await fetch('https://mindicador.cl/api');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Exchange rates data:', data);

        if (!data[currency]) {
            throw new Error(`Currency ${currency} not found in API data`);
        }

        const conversionRate = data[currency].valor;
        const convertedAmount = (amount / conversionRate).toFixed(2);
        resultDiv.textContent = `Resultado: ${convertedAmount} ${currency.toUpperCase()}`;

        console.log('Fetching historical data...');
        const historyResponse = await fetch(`https://mindicador.cl/api/${currency}`);
        
        if (!historyResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const historyData = await historyResponse.json();
        console.log('Historical data:', historyData);

        const dates = historyData.serie.slice(0, 10).map(item => item.fecha.split('T')[0]);
        const values = historyData.serie.slice(0, 10).map(item => item.valor);

        window.myChart.data.labels = dates;
        window.myChart.data.datasets[0].data = values;
        window.myChart.update();

    } catch (error) {
        resultDiv.textContent = 'Error al obtener los datos. Por favor, intente nuevamente.';
        console.error('Error fetching data:', error);
    }
});