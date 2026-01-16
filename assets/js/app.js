document.addEventListener('DOMContentLoaded', () => {
    const lyrics = [
        'чики бамбони',
        'чики влюбленный',
    ];

    let count = 0;
    const totalRepeats = 15 * 4; 

    const interval = setInterval(() => {
        console.log(lyrics[count % 2]);
        count++;

        if (count >= totalRepeats) {
            clearInterval(interval);
            console.log('🎵 Песня закончилась!, спасибо что зашли в консоль');
        }
    }, 1000);


    const data = [
        { name: 'Выручка, руб', current: '560521', yesterday: '480521', weekDay: '4805121' },
        { name: 'Наличными', current: '3', yesterday: '4', weekDay: '3' },
        { name: 'Безналичный расчет', current: '100000', yesterday: '100000', weekDay: '100000' },
        { name: 'Кредитные карты', current: '100521', yesterday: '100521', weekDay: '100521' },
        { name: 'Средний чек, руб', current: '1300', yesterday: '900', weekDay: '600' },
        { name: 'Средняя гость, руб', current: '1200', yesterday: '800', weekDay: '800' },
        { name: 'Удаления из чека (после оплаты), руб', current: '1000', yesterday: '1300', weekDay: '900' },
        { name: 'Удаления из чека (до оплаты), руб', current: '1300', yesterday: '1300', weekDay: '900' },
        { name: 'Количество чеков', current: '34', yesterday: '36', weekDay: '34' },
        { name: 'Количество гостей', current: '34', yesterday: '36', weekDay: '32' }
    ];

    let activeRow = null;
    let chart = null;

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    function calculatePercent(current, yesterday) {
        const curr = parseFloat(current);
        const yest = parseFloat(yesterday);
        if (yest === 0) return '0%';
        const percent = ((curr - yest) / yest) * 100;
        const sign = percent > 0 ? '+' : '';
        return sign + percent.toFixed(0) + '%';
    }

    function renderTable() {
        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = '';

        data.forEach((row, index) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'deltatest__row';
            rowEl.dataset.index = index;

            const percent = calculatePercent(row.current, row.yesterday);
            const yesterdayClass = percent.startsWith('+') ? 'deltatest__cell--positive' :
                (percent.startsWith('-') ? 'deltatest__cell--negative' : '');

            const currentNum = parseFloat(row.current);
            const weekDayNum = parseFloat(row.weekDay);
            const weekDayClass = currentNum > weekDayNum ? 'deltatest__cell--positive' :
                (currentNum < weekDayNum ? 'deltatest__cell--negative' : '');

            rowEl.innerHTML = `
          <div class="deltatest__cell">${row.name}</div>
          <div class="deltatest__cell deltatest__cell--current">${formatNumber(row.current)}</div>
          <div class="deltatest__cell ${yesterdayClass}">
            <span>${formatNumber(row.yesterday)}</span>
            <span class="deltatest__cell-percent">${percent}</span>
          </div>
          <div class="deltatest__cell ${weekDayClass}">${formatNumber(row.weekDay)}</div>
        `;

            rowEl.addEventListener('click', () => handleRowClick(index, rowEl));
            tbody.appendChild(rowEl);
        });
    }

    function handleRowClick(index, rowEl) {
        const tbody = document.getElementById('tableBody');
        const existingChart = document.getElementById('chart-' + index);

        if (activeRow === index && existingChart) {
            existingChart.remove();
            rowEl.classList.remove('deltatest__row--active');
            activeRow = null;
            if (chart) {
                chart.destroy();
                chart = null;
            }
            return;
        }

        const allCharts = tbody.querySelectorAll('.deltatest__chart');
        allCharts.forEach(c => c.remove());

        const rows = document.querySelectorAll('.deltatest__row');
        rows.forEach(r => r.classList.remove('deltatest__row--active'));

        rowEl.classList.add('deltatest__row--active');
        activeRow = index;

        const chartContainer = document.createElement('div');
        chartContainer.className = 'deltatest__chart';
        chartContainer.id = 'chart-' + index;
        chartContainer.innerHTML = '<div class="deltatest__chart-container" id="chart-content-' + index + '"></div>';

        rowEl.insertAdjacentElement('afterend', chartContainer);

        setTimeout(() => {
            chartContainer.classList.add('deltatest__chart--visible');
            setTimeout(() => {
                renderChart(data[index], 'chart-content-' + index);
            }, 100);
        }, 10);
    }

    function renderChart(rowData, containerId) {
        const categories = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        const currentValue = parseFloat(rowData.current);
        const yesterdayValue = parseFloat(rowData.yesterday);
        const weekDayValue = parseFloat(rowData.weekDay);

        const chartData = [
            currentValue * 0.6,
            currentValue * 0.8,
            yesterdayValue,
            currentValue * 0.9,
            currentValue,
            weekDayValue,
            currentValue * 1.1
        ];

        if (chart) {
            chart.destroy();
        }

        chart = Highcharts.chart(containerId, {
            chart: {
                type: 'line'
            },
            title: {
                text: rowData.name
            },
            xAxis: {
                categories: categories
            },
            yAxis: {
                title: {
                    text: 'Значение'
                }
            },
            tooltip: {
                formatter: function () {
                    return '<b>' + this.x + '</b><br/>' +
                        this.series.name + ': <b>' + this.y.toFixed(2) + '</b>';
                }
            },
            series: [{
                name: rowData.name,
                data: chartData,
                color: '#4CAF50'
            }],
            credits: {
                enabled: false
            }
        });
    }

    renderTable();
})