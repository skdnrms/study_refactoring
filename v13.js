var plays = {
    'hamlet': {
        'name': 'Hamlet',
        'type': 'tragedy'
    },
    'as-like': {
        'name': 'As You Like It',
        'type': 'comedy'
    },
    'othello': {
        'name': 'Othello',
        'type': 'tragedy'
    }
};

var invoices = [
    {
        'customer': 'BigCo',
        'performances': [
            {
                'playID': 'hamlet',
                'audience': 55
            },
            {
                'playID': 'as-like',
                'audience': 35
            },
            {
                'playID': 'othello',
                'audience': 40
            },
        ]
    }
];

// createStatementData.js
function createStatementData(invoice, plays) {
    const statementData = {};
    statementData.customer = invoice.customer;
    statementData.performances = invoice.performances.map(enrichPerformance);
    statementData.totalAmount = totalAmount(statementData);
    statementData.totalVolumeCredits = totalVolumeCredits(statementData);
    return statementData;

    function enrichPerformance(aPerformance) {
        const calculator = createPerformanceCalculator(aPerformance, playFor(aPerformance));
        const result = Object.assign({}, aPerformance);
        result.play = calculator.play;
        result.amount = calculator.amount;
        result.volumeCredits = calculator.volumeCredits;
        return result;
    }
    
    function playFor(aPerformance) {
        return plays[aPerformance.playID];
    }
    
    function totalVolumeCredits(data) {
        return data.performances.reduce((total, p) => total + p.volumeCredits, 0);
    }
    
    function totalAmount(data) {
        return data.performances.reduce((total, p) => total + p.amount, 0);
    }
}

// statement.js
function statement(invoice, plays) {
    return renderPlainText(createStatementData(invoice, plays));
}

function renderPlainText(data) {
    var result = `청구 내역 (고객명: ${data.customer})\n`;
    for (var perf of data.performances) {
        // 청구 내역을 출력한다.
        result += ` ${perf.play.name}: ${usd(perf.amount)} (${perf.audience}석)\n`
    }

    result += `총액: ${usd(data.totalAmount)}\n`;
    result += `적립 포인트: ${data.totalVolumeCredits}점\n`;
    return result;
}

function htmlStatment(invoice, plays) {
    return renderHtml(createStatementData(invoice, plays))
}

function renderHtml(data) {
    var result = `<h1>청구 내역 (고객명: ${data.customer})</h1>\n`;
    result += `<table>\n`;
    result += `<tr><th>연극</th><th>좌석 수</th><th>금액</th></tr>`;
    for (var perf of data.performances) {
        // 청구 내역을 출력한다.
        result += ` <tr><td>${perf.play.name}</td><td>${usd(perf.amount)}</td><td>${perf.audience}석</td></tr>\n`
    }
    result += `</table>`;
    result += `<p>총액: <em>${usd(data.totalAmount)}</em></p>\n`;
    result += `<p>적립 포인트: <em>${data.totalVolumeCredits}</em>점</p>\n`;
    return result;
}

function usd(aNumber) {
    return new Intl.NumberFormat('en-US', {
        'style': 'currency',
        'currency': 'USD',
        'minimumFractionDigits': 2
    }).format(aNumber/100);
}

class PerformanceCalculator {
    constructor(aPerformance, aPlay) {
        this.performance = aPerformance;
        this.play = aPlay;
    }

    get amount() {
        throw new Error(`알 수 없는 장르: ${this.play.type}`);
    }

    get volumeCredits() {
        return Math.max(this.performance.audience - 30, 0);
    }
}

class TragedyCalculator extends PerformanceCalculator {
    get amount() {
        var result = 40000;
        if (this.performance.audience > 30) {
            result += 1000 * (this.performance.audience - 30);
        }
        return result;
    }
}

class ComedyCalculator extends PerformanceCalculator {
    get amount() {
        var result = 30000;
        if (this.performance.audience > 20) {
            result += 10000 + 500 * (this.performance.audience - 20);
        }
        result += 300 * this.performance.audience;
        return result;
    }

    get volumeCredits() {
        return super.volumeCredits + Math.floor(this.performance.audience / 5);
    }
}

function createPerformanceCalculator(aPerformance, aPlay) {
        switch (aPlay.type) {
            case 'tragedy': // 비극
                return new TragedyCalculator(aPerformance, aPlay);
            case 'comedy': // 희극
                return new ComedyCalculator(aPerformance, aPlay);
            default:
                throw new Error(`알 수 없는 장르: ${aplay.type}`);
        }
}

console.log(statement(invoices[0], plays));
console.log(htmlStatment(invoices[0], plays));