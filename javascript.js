document.getElementById('loanForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Obtener los valores del formulario
    const nombreCliente = document.getElementById('nombreCliente').value;
    const capital = parseFloat(document.getElementById('capital').value);
    const tasaInteresAnual = parseFloat(document.getElementById('tasa').value) / 100;
    const plazo = parseInt(document.getElementById('plazo').value);
    const tipoPago = document.getElementById('tipoPago').value;

    let resultado = '';

    if (tipoPago === 'saldo') {
        resultado = generarTablaSobreSaldos(capital, tasaInteresAnual, plazo);
    } else {
        resultado = generarTablaCuotaFija(capital, tasaInteresAnual, plazo);
    }

    document.getElementById('resultado').innerHTML = resultado;
});

// Función para generar una tabla para el método de Sobre Saldos
function generarTablaSobreSaldos(capital, tasa, plazo) {
    let saldo = capital;
    let pagoMensual = 0;
    let resultado = `
    <h3>Proyección Sobre Saldos:</h3>
    <table>
        <thead>
            <tr>
                <th>Mes</th>
                <th>Pago Mensual (Q)</th>
                <th>Saldo Restante (Q)</th>
            </tr>
        </thead>
        <tbody>`;

    for (let i = 1; i <= plazo; i++) {
        let interesMensual = saldo * (tasa / 12);
        pagoMensual = (capital / plazo) + interesMensual;
        saldo -= capital / plazo;

        resultado += `
        <tr>
            <td>${i}</td>
            <td>${pagoMensual.toFixed(2)}</td>
            <td>${saldo.toFixed(2)}</td>
        </tr>`;
    }

    resultado += `</tbody></table>`;
    return resultado;
}

// Función para generar una tabla para el método de Cuota Fija
function generarTablaCuotaFija(capital, tasa, plazo) {
    const tasaMensual = tasa / 12;
    const cuota = capital * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);
    let saldo = capital;

    let resultado = `
    <h3>Cuota Fija:</h3>
    <table>
        <thead>
            <tr>
                <th>Mes</th>
                <th>Cuota Mensual (Q)</th>
                <th>Interés (Q)</th>
                <th>Capital Pagado (Q)</th>
                <th>Saldo Restante (Q)</th>
            </tr>
        </thead>
        <tbody>`;

    for (let i = 1; i <= plazo; i++) {
        let interesMensual = saldo * tasaMensual;
        let capitalPagado = cuota - interesMensual;
        saldo -= capitalPagado;

        resultado += `
        <tr>
            <td>${i}</td>
            <td>${cuota.toFixed(2)}</td>
            <td>${interesMensual.toFixed(2)}</td>
            <td>${capitalPagado.toFixed(2)}</td>
            <td>${saldo.toFixed(2)}</td>
        </tr>`;
    }

    resultado += `</tbody></table>`;
    return resultado;
}

// Función para generar el PDF con la tabla
document.getElementById('generarPDF').addEventListener('click', function() {
    const nombreCliente = document.getElementById('nombreCliente').value;
    const capital = document.getElementById('capital').value;
    const tasa = document.getElementById('tasa').value;
    const plazo = document.getElementById('plazo').value;
    const tipoPago = document.getElementById('tipoPago').value;

    const resultadoHTML = document.getElementById('resultado').innerText;

    // Crear el documento PDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Proyección de Créditos', 20, 20);
    doc.setFontSize(12);
    doc.text(`Nombre del Cliente: ${nombreCliente}`, 20, 30);
    doc.text(`Capital Solicitado: Q${capital}`, 20, 40);
    doc.text(`Tasa de Interés Anual: ${tasa}%`, 20, 50);
    doc.text(`Plazo: ${plazo} meses`, 20, 60);
    doc.text(`Tipo de Pago: ${tipoPago === 'saldo' ? 'Sobre Saldos' : 'Cuota Fija'}`, 20, 70);

    // Obtener las filas de la tabla
    const rows = document.querySelectorAll("table tbody tr");

    // Dibujar la tabla en el PDF
    let startY = 80;
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td");
        const mes = cells[0].textContent;
        const cuota = cells[1].textContent;
        const saldoRestante = cells[cells.length - 1].textContent;

        doc.text(`Mes ${mes}: Cuota = Q${cuota}, Saldo Restante = Q${saldoRestante}`, 20, startY + (index * 10));
    });

    // Guardar el PDF
    doc.save(`proyeccion_credito_${nombreCliente}.pdf`);
});
