document.addEventListener('DOMContentLoaded', () => {
    // Chart.js Dark Mode Defaults
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = '#cbd5e1';
        Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    }

    // Tab Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Helper: marked simple to HTML (since no marked.js imported, simple replace)
    function formatText(text) {
        if(!text) return '';
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/\n\n/g, '<br><br>');
        html = html.replace(/\n/g, '<br>');
        return html;
    }

    // --- Stock Analysis ---
    let stockChartInstance = null;
    document.getElementById('btn-stock-analyze').addEventListener('click', async () => {
        const ticker = document.getElementById('stock-ticker').value;
        const days = document.getElementById('stock-days').value;
        if(!ticker) return alert('Enter a stock ticker');

        const loading = document.getElementById('stock-loading');
        const results = document.getElementById('stock-results');
        
        loading.classList.remove('hidden');
        results.classList.add('hidden');

        try {
            const res = await fetch('/api/stock-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, predict_days: days })
            });
            const data = await res.json();
            
            if(data.error) throw new Error(data.error);

            document.getElementById('stock-ai-analysis').innerHTML = formatText(data.analysis);
            
            // Render Chart
            const ctx = document.getElementById('stockChart').getContext('2d');
            if(stockChartInstance) stockChartInstance.destroy();
            
            const labels = [...data.history.dates, ...data.forecast.dates];
            const historyPrices = [...data.history.prices, ...Array(data.forecast.dates.length).fill(null)];
            const forecastPrices = [...Array(data.history.dates.length).fill(null), ...data.forecast.yhat];
            
            stockChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `Historical Close (${data.currency})`,
                            data: historyPrices,
                            borderColor: '#f8fafc',
                            borderWidth: 2,
                            tension: 0.1,
                            pointRadius: 0
                        },
                        {
                            label: `Forecast (${data.currency})`,
                            data: forecastPrices,
                            borderColor: '#2563eb',
                            borderDash: [5, 5],
                            borderWidth: 2,
                            tension: 0.1,
                            pointRadius: 3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: { title: { display: true, text: `Price Forecast for ${data.ticker}` } }
                }
            });

            results.classList.remove('hidden');
        } catch(e) {
            alert('Error: ' + e.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    // --- Finance Chatbot ---
    // Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;
    
    document.getElementById('btn-chat-voice').addEventListener('click', () => {
        if(!recognition) return alert('Voice recognition not supported in this browser.');
        recognition.start();
        document.getElementById('chat-input').placeholder = "Listening...";
    });
    
    if(recognition) {
        recognition.onresult = (event) => {
            const text = event.results[0][0].transcript;
            document.getElementById('chat-input').value = text;
            document.getElementById('chat-input').placeholder = "📝 Ask a finance-related question...";
        };
        recognition.onerror = () => {
            document.getElementById('chat-input').placeholder = "📝 Ask a finance-related question...";
            alert("Error with microphone input");
        };
    }

    document.getElementById('btn-chat-ask').addEventListener('click', async () => {
        const question = document.getElementById('chat-input').value;
        const lang = document.getElementById('chat-lang').value;
        if(!question) return;

        const loading = document.getElementById('chat-loading');
        const responseBox = document.getElementById('chat-response');
        
        loading.classList.remove('hidden');
        responseBox.classList.add('hidden');

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, lang })
            });
            const data = await res.json();
            
            if(data.error) throw new Error(data.error);

            document.getElementById('chat-answer-text').innerHTML = formatText(data.answer);
            responseBox.classList.remove('hidden');

            // Play TTS natively
            const utterance = new SpeechSynthesisUtterance(data.answer);
            utterance.lang = lang === 'en' ? 'en-US' : (lang === 'hi' ? 'hi-IN' : 'gu-IN');
            window.speechSynthesis.speak(utterance);

        } catch(e) {
            alert('Error: ' + e.message);
        } finally {
            loading.classList.add('hidden');
        }
    });

    // --- Portfolio Analysis ---
    document.getElementById('btn-port-analyze').addEventListener('click', async () => {
        const ticker = document.getElementById('port-ticker').value;
        const shares = document.getElementById('port-shares').value;
        const recession = document.getElementById('port-recession').value;

        if(!ticker || shares <= 0) return alert('Enter valid ticker and shares');

        const btn = document.getElementById('btn-port-analyze');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Analyzing...';
        btn.disabled = true;

        try {
            const res = await fetch('/api/portfolio-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker, shares, recession })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);

            const resultsDiv = document.getElementById('port-results');
            resultsDiv.innerHTML = `
                <div class="analysis-card success-card">
                    <h3>🧾 Portfolio Analysis Report for ${data.ticker}</h3>
                    <p><strong>Current Price:</strong> ${data.current_price.toFixed(2)} ${data.currency}</p>
                    <p><strong>Total Holdings Value:</strong> ${data.total_value.toFixed(2)} ${data.currency}</p>
                    <div class="response-box" style="margin-top:15px;">
                        ${formatText(data.analysis)}
                    </div>
                </div>
            `;
            resultsDiv.classList.remove('hidden');
        } catch(e) {
            alert('Error: ' + e.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // --- Diversification ---
    document.getElementById('btn-div-analyze').addEventListener('click', async () => {
        const tickers = document.getElementById('div-tickers').value;
        if(!tickers) return;

        try {
            const res = await fetch('/api/diversification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tickers })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);

            const badge = document.getElementById('div-badge');
            badge.textContent = data.classification;
            badge.className = 'classification-badge';
            if(data.classification === 'High Risk') badge.classList.add('badge-high-risk');
            else if(data.classification === 'Neutral') badge.classList.add('badge-neutral');
            else badge.classList.add('badge-diversified');

            document.getElementById('div-summary-text').innerHTML = `
                <p>Your portfolio includes stocks from <strong>${data.unique_count} unique sectors</strong>: ${data.sectors.join(', ')}.</p>
                <br>
                <p>Based on this, your portfolio is classified as <strong>${data.classification}</strong>.</p>
            `;
            document.getElementById('div-results').classList.remove('hidden');
        } catch(e) {
            alert('Error: ' + e.message);
        }
    });

    // --- Budget ---
    let budgetChartInstance = null;
    document.getElementById('btn-budget-gen').addEventListener('click', async () => {
        const income = document.getElementById('budget-income').value;
        const debt = document.getElementById('budget-debt').value;
        const goalsSelect = document.getElementById('budget-goals');
        const goals = Array.from(goalsSelect.selectedOptions).map(opt => opt.value);

        if(!income || income <= 0) return alert('Enter valid income');

        try {
            const res = await fetch('/api/budget', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ income, debt, goals })
            });
            const data = await res.json();
            if(data.error) throw new Error(data.error);

            const pctList = document.getElementById('budget-pct-list');
            const amtList = document.getElementById('budget-amt-list');
            pctList.innerHTML = ''; amtList.innerHTML = '';

            const keys = ['essentials', 'savings', 'debt', 'discretionary'];
            const labelsMap = {essentials: 'Essentials', savings: 'Savings', debt: 'Debt Repayment', discretionary: 'Discretionary'};
            
            keys.forEach(k => {
                if(k === 'debt' && data.percentages[k] === 0) return;
                
                pctList.innerHTML += `<li><span>${labelsMap[k]}</span> <strong>${data.percentages[k].toFixed(1)}%</strong></li>`;
                amtList.innerHTML += `<li><span>${labelsMap[k]}</span> <strong>$${data.amounts[k].toFixed(2)}</strong></li>`;
            });

            document.getElementById('budget-results').classList.remove('hidden');
            document.getElementById('budget-chart-container').style.display = 'block';

            const ctx = document.getElementById('budgetChart').getContext('2d');
            if(budgetChartInstance) budgetChartInstance.destroy();
            
            const chartData = keys.map(k => data.percentages[k]);
            
            budgetChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: keys.map(k => labelsMap[k]),
                    datasets: [{
                        data: chartData,
                        backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b']
                    }]
                },
                options: { responsive: true }
            });

        } catch(e) {
            alert('Error: ' + e.message);
        }
    });
});
