document.addEventListener('DOMContentLoaded', () => {

    // 1. ส่วนเลือกองค์ประกอบ DOM (DOM Selectors)
    const costInput = document.getElementById('item-cost');
    const rateSelect = document.getElementById('value-back-rate');
    const calcButton = document.getElementById('calculate-btn');
    const resultContainer = document.getElementById('result-container');
    const resultCost = document.getElementById('result-cost');
    const resultPoints = document.getElementById('result-points-value');

    // 2. ฟังก์ชันหลักในการคำนวณแต้ม (Calculation Logic)
    const calculatePoints = () => {
        const cost = parseFloat(costInput.value);
        const rate = parseFloat(rateSelect.value);

        if (isNaN(cost) || cost <= 0) {
            resultContainer.classList.add('hidden');
            alert('กรุณาใส่ราคาทุนให้ถูกต้อง');
            costInput.focus();
            return;
        }

        // สูตร: (ราคาทุน / อัตราผลตอบแทน) / 100
        const requiredSpending = cost / rate;
        const pointsNeeded = requiredSpending / 100;

        // ปัดเศษให้เป็นจำนวนเต็มที่ใกล้เคียงที่สุด
        const finalPoints = Math.round(pointsNeeded);
        
        // แสดงผลลัพธ์
        resultCost.textContent = cost.toLocaleString();
        resultPoints.textContent = finalPoints.toLocaleString();
        resultContainer.classList.remove('hidden');
    };

    // 3. ส่วนจัดการ Event Listeners
    calcButton.addEventListener('click', calculatePoints);
    
    // ทำให้กด Enter แล้วคำนวณได้เลย
    costInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // ป้องกันการ submit form โดยไม่จำเป็น
            calculatePoints();
        }
    });
});