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
        const result = Object.assign({}, aPerformance);
        result.play = playFor(result);
        result.amount = amountFor(result);
        result.volumeCredits = volumeCreditsFor(result);
        return result;
    }
    
    function playFor(aPerformance) {
        return plays[aPerformance.playID];
    }
    
    function amountFor(aPerformance) {
        var result = 0;
        switch (aPerformance.play.type) {
            case 'tragedy': // 비극
                result = 40000;
                if (aPerformance.audience > 30) {
                    result += 1000 * (aPerformance.audience - 30);
                }
                break;
            case 'comedy': // 희극
                result = 30000;
                if (aPerformance.audience > 20) {
                    result += 10000 + 500 * (aPerformance.audience - 20);
                }
                result += 300 * aPerformance.audience;
                break;
            default:
                throw new Error(`알 수 없는 장르: ${aPerformance.play.type}`);
        }
        return result;
    }
    
    function volumeCreditsFor(aPerformance) {
        var volumeCredits = Math.max(aPerformance.audience - 30, 0);
    
        // 희극 관객 5명마다 추가 포인트를 제공한다.
        if ('comedy' === aPerformance.play.type) {
            volumeCredits += Math.floor(aPerformance.audience / 5)
        }
        return volumeCredits;
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

console.log(statement(invoices[0], plays));
console.log(htmlStatment(invoices[0], plays));