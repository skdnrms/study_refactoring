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

function statement(invoice, plays) {
    var totalAmount = 0;
    var volumeCredits = 0;
    var result = `청구 내역 (고객명: ${invoice.customer})\n`;
    var format = new Intl.NumberFormat('en-US', {
        'style': 'currency',
        'currency': 'USD',
        'minimumFractionDigits': 2
    }).format;

    for (var perf of invoice.performances) {
        // 포인트를 적립한다.
        volumeCredits += volumeCreditsFor(perf);

        // 청구 내역을 출력한다.
        result += ` ${playFor(perf).name}: ${format(amountFor(perf)/100)} (${perf.audience}석)\n`
        totalAmount += amountFor(perf);
    }

    result += `총액: ${format(totalAmount/100)}\n`;
    result += `적립 포인트: ${volumeCredits}점\n`;
    return result;

    function amountFor(aPerformance) {
        var result = 0;
        switch (playFor(aPerformance).type) {
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
                throw new Error(`알 수 없는 장르: ${playFor(aPerformance).type}`);
        }
        return result;
    }

    function playFor(aPerformance) {
        return plays[aPerformance.playID];
    }

    function volumeCreditsFor(aPerformance) {
        var volumeCredits = Math.max(aPerformance.audience - 30, 0);

        // 희극 관객 5명마다 추가 포인트를 제공한다.
        if ('comedy' === playFor(aPerformance).type) {
            volumeCredits += Math.floor(aPerformance.audience / 5)
        }
        return volumeCredits;
    }
}

console.log(statement(invoices[0], plays));