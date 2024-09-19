// ==UserScript==
// @name         Trimitere Task si Email
// @namespace    http://tampermonkey.net/
// @version      3.2
// @description  Adaugă un buton și un formular pe pagina web care trimite date către Google Apps Script
// @author       ORCT_AR
// @match        *://rc-prod.onrc.sii/*
// @match        *://onrc.eu.org/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      onrc.eu.org
// @updateURL    https://github.com/kitaroar/task_monkey_siiv2/raw/refs/heads/main/Email_Task_Monkey_SIIv2.user.js
// @downloadURL  https://github.com/kitaroar/task_monkey_siiv2/raw/refs/heads/main/Email_Task_Monkey_SIIv2.user.js
// ==/UserScript==

(function() {
    'use strict';

    // Definire variabile
    let usernameExpeditor = '';
    let usernameDestinatar = '';
    let numarInregistrare = '';
    let dataInregistrare = '';
    let registrator = '';
    let judr = '';
    let operator = '';
    let judo = '';
    let judcerere = '';
    let firma = '';
    let mailJudet = '';
    let formData = ''; // Will store form data (checkboxes and message)

    // Creăm un buton pe pagina web
    const button = document.createElement('button');
    button.innerHTML = 'Adaugă Task';
    button.style.position = 'fixed'; // Facem butonul vizibil permanent
    button.style.bottom = '10px'; // Plasăm butonul în colțul din dreapta jos
    button.style.right = '20px';
    button.style.padding = '4px 10px';
    button.style.borderRadius = '3px';
    button.style.color = '#FFF';
    button.style.backgroundColor = 'orange';
    button.style.border = '1px solid orange';
    button.style.zIndex = 1000;

    // Adăugăm butonul în document
    document.body.appendChild(button);

    // Add event listener to the button to open the form
    button.addEventListener('click', function() {
        // Function to get the value of a cookie by name
        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        usernameExpeditor = getCookie('username') || 'Necunoscut';
        if(usernameExpeditor === 'Necunoscut'){
            alert('Username necunoscut. Te rog să dai Logout si sa intri iar in program');
            return; // Prevent form to open
        }

        const headers = document.querySelectorAll('th.ant-table-cell');

        let columnIndexes = {
            numarInregistrare: -1,
            dataInregistrare: -1,
            registrator: -1,
            operator: -1
        };

        // Find the column indices based on the header text
        headers.forEach((header, index) => {
            const headerText = header.innerText.trim();
            if (headerText.includes('Număr înregistrare')) {
                columnIndexes.numarInregistrare = index;
            } else if (headerText.includes('Dată înregistrare')) {
                columnIndexes.dataInregistrare = index;
            } else if (headerText.includes('Judet cerere')) {
                columnIndexes.judcerere = index;
            }else if (headerText.includes('Registrator')) {
                columnIndexes.registrator = index;
            } else if (headerText.includes('Judet registrator')) {
                columnIndexes.judr = index;
            } else if (headerText.includes('Firmă')) {
                columnIndexes.firma = index;
            } else if (headerText.includes('Operator')) {
                columnIndexes.operator = index;
            } else if (headerText.includes('Judet operator')) {
                columnIndexes.judo = index;
            } else if (headerText.includes('Firmă')) {
                columnIndexes.firma = index;
            }
        });

        // Select the 3rd row (excluding the header and filter rows)
        //const thirdRow = document.querySelectorAll('tr.ant-table-row')[2];

        const currentUrl = window.location.href;
        //if (currentUrl.substr(currentUrl.length - 7) != 'process') {
        if (currentUrl.indexOf('/search-applications/process') !== -1) {
            const cereriInLista = document.querySelectorAll('tr.ant-table-row').length-2; //numarul de cereri existente in lista
            if (cereriInLista===0) { // daca nu e nicio cerere
                console.log('no rows');
                alert('Nu există nicio cerere în listă.');
                return; // Prevent form submission
            }
            let selectedRow = document.querySelectorAll('tr.ant-table-row')[2]; // implicit iau prima cerere care apare in lista chiar daca nu e selectata
            if (cereriInLista>1) { // daca exista mai mult de o cerere in lista, o iau pe cea care are clasa selected-row
                selectedRow = document.querySelectorAll('tr.ant-table-row.selected-row')[0];
            }
            if (selectedRow) { // daca exista o cerere selectata
                    const cells = selectedRow.querySelectorAll('td');
                    numarInregistrare = cells[columnIndexes.numarInregistrare]?.innerText.trim() || 'Necunoscut';
                    dataInregistrare = cells[columnIndexes.dataInregistrare]?.innerText.trim() || 'Necunoscut';
                    judcerere = cells[columnIndexes.judcerere]?.innerText.trim() || 'Necunoscut';
                    registrator = cells[columnIndexes.registrator]?.innerText.trim() || 'Necunoscut';
                    judr = cells[columnIndexes.judr]?.innerText.trim() || 'Necunoscut';
                    operator = cells[columnIndexes.operator]?.innerText.trim() || 'Necunoscut';
                    judo = cells[columnIndexes.judo]?.innerText.trim() || 'Necunoscut';
                    firma = cells[columnIndexes.firma]?.innerText.trim() || 'Necunoscut';
            } else { // daca nu exista selectedRow inseamna ca sunt mai multe in lista si nu s-a ales una
                console.log('no row selected');
                alert('Selectează mai întâi o cerere din listă!');
                return; // Prevent form submission
            }
        } else {
            console.log('3rd row not found');
            alert('Nu ești în fereastra care trebuie!\n\nIntră la Procesare cereri și caută un număr de dosar');
            return; // Prevent form submission
        }

        if(numarInregistrare === 'Necunoscut' || dataInregistrare === 'Necunoscut' ){
            alert('În această fereastră nu există date suficiente!\nnIntră la Procesare cereri și caută un număr de dosar');
            return; // Prevent form to open
        }

        createForm();
    });

    // Function to create and display the form
    function createForm() {
        // Create the form container
        const formContainer = document.createElement('div');
        formContainer.id = 'customForm';
        formContainer.style.position = 'fixed';
        formContainer.style.top = '20%';
        formContainer.style.left = '30%';
        formContainer.style.backgroundColor = 'white';
        formContainer.style.border = '1px solid #ccc';
        formContainer.style.padding = '30px';
        formContainer.style.borderRadius = '10px';
        formContainer.style.zIndex = 10000;
        formContainer.style.width = '600px';
        formContainer.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.1)';

        // Create the close button
        const closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '15px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '24px';
        closeButton.style.fontWeight = 'bolder';
        closeButton.style.color = 'darkred';

        closeButton.addEventListener('click', function() {
            document.body.removeChild(formContainer); // Close the form when 'X' is clicked
        });

        // Create the cancel button
        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = 'Renunță';
        cancelButton.style.position = 'absolute';
        cancelButton.style.bottom = '20px';
        cancelButton.style.right = '20px';
        cancelButton.style.padding = '2px 10px';
        cancelButton.style.border = '1px solid #AAA';
        cancelButton.style.fontSize = '16px';
        cancelButton.style.borderRadius = '3px';
        cancelButton.style.zIndex = 1000;
        cancelButton.style.backgroundColor = 'seashell';

        cancelButton.addEventListener('click', function() {
            document.body.removeChild(formContainer); // Close the form when 'Cancel' is clicked
        });

        // Append the close and cancel buttons
        formContainer.appendChild(closeButton);
        formContainer.appendChild(cancelButton);

        // Create the form element
        const formElement = document.createElement('form');
        formElement.id = 'myForm';

        // Set initial radio button states
        let operatorChecked = '';
        let registratorChecked = '';

        // Append the checkboxes and text area to the form
        const formContent = `
            <h3>Cererea Nr. <strong>${numarInregistrare}</strong> / <strong>${dataInregistrare}</strong></h3>
            <h3>Pentru firma: <strong>${firma}</strong> din <strong>${judcerere}</strong></h3>
            <hr>
            <div>
                <input type="checkbox" id="option1" name="options" value="Încărcați în opis încheierea semnată">
                <label for="option1">Încărcați în opis încheierea semnată</label><br>
            </div>
            <div>
                <input type="checkbox" id="option2" name="options" value="Încărcați în opis încheierea nesemnată">
                <label for="option2">Încărcați în opis încheierea nesemnată</label><br>
            </div>
            <div>
                <input type="checkbox" id="option3" name="options" value="Corectați opisul cererii de la pagina - la pagina">
                <label for="option3">Corectați opisul cererii de la pagina - la pagina</label><br>
            </div>
            <div>
                <input type="checkbox" id="option4" name="options" value="Procesați cererea">
                <label for="option4">Procesați cererea</label><br>
            </div>
            <div>
                <input type="checkbox" id="option5" name="options" value="Soluționați cererea">
                <label for="option5">Soluționați cererea</label><br>
            </div>
            <div>
                <input type="checkbox" id="option6" name="options" value="Solicitare cazier">
                <label for="option6">Solicitare cazier</label><br>
            </div>
            <br/>
            <div>
                <label for="messageBox">Alte probleme:</label><br>
                <textarea id="messageBox" name="message" rows="4"style="width: 100%;" ></textarea><br><br>
            </div>
            <div>
        <label>Trimite către:</label><br>

        <!-- Operator Checkbox -->
        <input type="checkbox" id="operatorCheckbox" name="role" value="${operator}" ${operatorChecked} ${( (usernameExpeditor === operator) || (operator === 'Necunoscut') ) ? 'disabled' : ''}>
        <label for="operatorCheckbox">Operator - ${operator} (${judo})</label><br>

        <!-- Registrator Checkbox -->
        <input type="checkbox" id="registratorCheckbox" name="role" value="${registrator}" ${registratorChecked} ${( (usernameExpeditor === registrator) || (registrator === 'Necunoscut') ) ? 'disabled' : ''}>
        <label for="registratorCheckbox">Registrator - ${registrator} (${judr})</label><br>

        <!-- ORCT Checkbox with Dropdown -->
        <div style="display: flex; align-items: center;">
            <input type="checkbox" id="orctCheckbox" name="role" value="ORCT">
            <label for="orctCheckbox">&nbsp;ORCT</label>

            <!-- Dropdown next to ORCT checkbox -->
            <select id="countySelect" style="margin-left: 10px;" disabled>
                <option value="orcab@ab.onrc.ro" ${judcerere === 'Alba' ? 'selected' : ''}>Alba</option>
                <option value="orcar@ar.onrc.ro" ${judcerere === 'Arad' ? 'selected' : ''}>Arad</option>
                <option value="orcag@ag.onrc.ro" ${judcerere === 'Argeş' ? 'selected' : ''}>Argeş</option>
                <option value="orcbc@bc.onrc.ro" ${judcerere === 'Bacău' ? 'selected' : ''}>Bacău</option>
                <option value="orcbh@bh.onrc.ro" ${judcerere === 'Bihor' ? 'selected' : ''}>Bihor</option>
                <option value="orcbn@bn.onrc.ro" ${judcerere === 'Bistriţa-Năsăud' ? 'selected' : ''}>Bistriţa-Năsăud</option>
                <option value="orcbt@bt.onrc.ro" ${judcerere === 'Botoşani' ? 'selected' : ''}>Botoşani</option>
                <option value="orcbv@bv.onrc.ro" ${judcerere === 'Braşov' ? 'selected' : ''}>Braşov</option>
                <option value="orcbr@br.onrc.ro" ${judcerere === 'Brăila' ? 'selected' : ''}>Brăila</option>
                <option value="orcb@b.onrc.ro" ${judcerere === 'Bucureşti' ? 'selected' : ''}>Bucureşti</option>
                <option value="orcbz@bz.onrc.ro" ${judcerere === 'Buzău' ? 'selected' : ''}>Buzău</option>
                <option value="orccs@cs.onrc.ro" ${judcerere === 'Caraş-Severin' ? 'selected' : ''}>Caraş-Severin</option>
                <option value="orccj@cj.onrc.ro" ${judcerere === 'Cluj' ? 'selected' : ''}>Cluj</option>
                <option value="orcct@ct.onrc.ro" ${judcerere === 'Constanţa' ? 'selected' : ''}>Constanţa</option>
                <option value="orccv@cv.onrc.ro" ${judcerere === 'Covasna' ? 'selected' : ''}>Covasna</option>
                <option value="orccl@cl.onrc.ro" ${judcerere === 'Călăraşi' ? 'selected' : ''}>Călăraşi</option>
                <option value="orcdj@dj.onrc.ro" ${judcerere === 'Dolj' ? 'selected' : ''}>Dolj</option>
                <option value="orcdb@db.onrc.ro" ${judcerere === 'Dâmboviţa' ? 'selected' : ''}>Dâmboviţa</option>
                <option value="orcgl@gl.onrc.ro" ${judcerere === 'Galați' ? 'selected' : ''}>Galați</option>
                <option value="orcgr@gr.onrc.ro" ${judcerere === 'Giurgiu' ? 'selected' : ''}>Giurgiu</option>
                <option value="orcgj@gj.onrc.ro" ${judcerere === 'Gorj' ? 'selected' : ''}>Gorj</option>
                <option value="orchr@hr.onrc.ro" ${judcerere === 'Harghita' ? 'selected' : ''}>Harghita</option>
                <option value="orchd@hd.onrc.ro" ${judcerere === 'Hunedoara' ? 'selected' : ''}>Hunedoara</option>
                <option value="orcil@il.onrc.ro" ${judcerere === 'Ialomiţa' ? 'selected' : ''}>Ialomiţa</option>
                <option value="orcis@is.onrc.ro" ${judcerere === 'Iaşi' ? 'selected' : ''}>Iaşi</option>
                <option value="orcif@if.onrc.ro" ${judcerere === 'Ilfov' ? 'selected' : ''}>Ilfov</option>
                <option value="orcmm@mm.onrc.ro" ${judcerere === 'Maramureş' ? 'selected' : ''}>Maramureş</option>
                <option value="orcmh@mh.onrc.ro" ${judcerere === 'Mehedinţi' ? 'selected' : ''}>Mehedinţi</option>
                <option value="orcms@ms.onrc.ro" ${judcerere === 'Mureş' ? 'selected' : ''}>Mureş</option>
                <option value="orcnt@nt.onrc.ro" ${judcerere === 'Neamţ' ? 'selected' : ''}>Neamţ</option>
                <option value="orcot@ot.onrc.ro" ${judcerere === 'Olt' ? 'selected' : ''}>Olt</option>
                <option value="orcph@ph.onrc.ro" ${judcerere === 'Prahova' ? 'selected' : ''}>Prahova</option>
                <option value="orcsm@sm.onrc.ro" ${judcerere === 'Satu Mare' ? 'selected' : ''}>Satu Mare</option>
                <option value="orcsb@sb.onrc.ro" ${judcerere === 'Sibiu' ? 'selected' : ''}>Sibiu</option>
                <option value="orcsv@sv.onrc.ro" ${judcerere === 'Suceava' ? 'selected' : ''}>Suceava</option>
                <option value="orcsj@sj.onrc.ro" ${judcerere === 'Sălaj' ? 'selected' : ''}>Sălaj</option>
                <option value="orctr@tr.onrc.ro" ${judcerere === 'Teleorman' ? 'selected' : ''}>Teleorman</option>
                <option value="orctm@tm.onrc.ro" ${judcerere === 'Timiş' ? 'selected' : ''}>Timiş</option>
                <option value="orctl@tl.onrc.ro" ${judcerere === 'Tulcea' ? 'selected' : ''}>Tulcea</option>
                <option value="orcvs@vs.onrc.ro" ${judcerere === 'Vaslui' ? 'selected' : ''}>Vaslui</option>
                <option value="orcvn@vn.onrc.ro" ${judcerere === 'Vrancea' ? 'selected' : ''}>Vrancea</option>
                <option value="orcvl@vl.onrc.ro" ${judcerere === 'Vâlcea' ? 'selected' : ''}>Vâlcea</option>
            </select>
        </div>
    </div>
            <br/><br/>
            <input type="submit" value="Trimite" style="position: absolute; bottom: 20px; background-color: honeydew; left: 20px; padding: 2px 10px; border: 1px solid #AAA; font-size: 16px; border-radius: 3px; z-index: 1000;">
        `;

        // Append the form content to the form
        formElement.innerHTML = formContent;

        // Append the form to the form container
        formContainer.appendChild(formElement);

        // Add the form container to the body
        document.body.appendChild(formContainer);

        document.getElementById('orctCheckbox').addEventListener('change', function() {
        const countySelect = document.getElementById('countySelect');
        countySelect.disabled = !this.checked; // Enable dropdown when ORCT is checked
        });

        // Ensure that only one of the checkboxes (operator or registrator) is checked at a time
        const operatorCheckbox = document.getElementById('operatorCheckbox');
        const registratorCheckbox = document.getElementById('registratorCheckbox');

        // Logic to disable operator or registrator based on the current user's role
        if (usernameExpeditor === operator) {
            operatorCheckbox.disabled = true; // Disable operator checkbox if user is operator
        } else if (usernameExpeditor === registrator) {
            registratorCheckbox.disabled = true; // Disable registrator checkbox if user is registrator
        }

        // Add event listener for form submission
        document.getElementById('myForm').addEventListener('submit', function(event) {
            event.preventDefault();

            // Get selected checkboxes
            let selectedOptions = [];
            document.querySelectorAll('input[name="options"]:checked').forEach((checkbox) => {
                selectedOptions.push(checkbox.value);
            });

            // Get the message box content
            let message = document.getElementById('messageBox').value.trim();

            // Get the selected role
            let role = document.querySelector('input[name="role"]:checked')?.value || 'Necunoscut';

            // Combine selected checkboxes, message, and role into one string
            // Combine selected checkboxes and message into one string
            if (selectedOptions.length > 0) {
                formData = selectedOptions.join(', ');
            } else {
                formData = ''; // No checkboxes selected
            }

            if (message) {
                // If there are selected options, append with a comma, otherwise just add the message
                formData += formData ? ', ' + message : message;
            }

            // Check if a message is empty
            if (formData.length==0) {
                alert('Bifează un mesaj sau scrie problema în caseta text!');
                return; // Prevent form submission
            }
            // Check if a destination is selected
            if (!document.querySelector('input[name="role"]:checked')) {
                alert('Alege un destinatar pentru mesaj!');
                return; // Prevent form submission
            }

            //usernameDestinatar = role

            // Get elements
            mailJudet = '';
            const operatorCheckbox = document.getElementById('operatorCheckbox');
            const registratorCheckbox = document.getElementById('registratorCheckbox');
            const orctCheckbox = document.getElementById('orctCheckbox');
            const countySelect = document.getElementById('countySelect');

            if (orctCheckbox.checked) {mailJudet = countySelect.value;} // Get the selected value from dropdown}

            if (operatorCheckbox.checked && registratorCheckbox.checked) {
                usernameDestinatar = JSON.stringify({operator: operator, registrator: registrator});
            } else if (registratorCheckbox.checked && !operatorCheckbox.checked) {
                usernameDestinatar = registrator;
            } else if (!registratorCheckbox.checked && operatorCheckbox.checked) {
                usernameDestinatar = operator;
            } else if (orctCheckbox.checked) {
                usernameDestinatar = mailJudet;
            }

            // Log the form data
            //console.log("Mesaj de trimis:", formData);
            //console.log("Destinatar: ", usernameDestinatar);

            // Call function to collect page data and submit everything
            collectDataAndSubmit();

            // Remove the form after submission
            document.body.removeChild(formContainer);
        });
    }

    // Function to collect data from the page and submit everything
    function collectDataAndSubmit() {

        // Variabila pentru test -> comenteaza in productie
        //usernameExpeditor = 'adriana.mirea';
        //numarInregistrare = '9999999';
        //dataInregistrare = '31.12.2024';
        //judcerere = 'Arad';
        //registrator = 'alexandra.decean';
        //operator = 'madalina.manda';
        //usernameDestinatar = JSON.stringify({registrator: registrator, operator: operator});
        //usernameDestinatar = 'alexandra.decean';
        //firma = 'TEST SRL';

        const dateDeTrimis = JSON.stringify({
            numarInregistrare: numarInregistrare,
            dataInregistrare: dataInregistrare,
            usernameDestinatar: usernameDestinatar,
            usernameExpeditor: usernameExpeditor,
            formData: formData,
        })

        console.log("Date transmise: ", dateDeTrimis);

        // Trimiterea datelor către Google Apps Script prin POST request
        GM_xmlhttpRequest({
            method: "POST",
            url: "https://onrc.eu.org/api/administrator/adauga-task",
            //url: "http://local.onrc.eu.org:3500/api/administrator/adauga-task",
            headers: { "Content-Type": "application/json" },
            data: dateDeTrimis,
            onload: function(response) {
                try {
                    // Parse the JSON response text
                    var data = JSON.parse(response.responseText);
                    console.log("Email Utilizator:", data.emailUtilizator);
                    console.log("Răspuns de API:", response.responseText);
                    //alert(data.message);

                    let emailDestinatar = data.emailUtilizator || 'Introdu adresa de email';
                    let subiect = 'Referitor la cererea: ' + numarInregistrare + ' din ' + dataInregistrare; // Subiectul emailului
                    let corpEmail = 'Vă rugăm să remediați cererea: ' + numarInregistrare + ' din ' + dataInregistrare + '\n\nProbleme semnalate: ' + formData;
                    if (data.emailDestinatar2 && data.emailDestinatar2.includes('@')) {
                        emailDestinatar += ',' + data.emailDestinatar2; // Add Destinatar2 to the recipients list if valid
                    }
                    if (mailJudet && mailJudet.includes('@') && mailJudet != emailDestinatar) {
                        emailDestinatar += ',' + mailJudet; // Add mailJudet to the recipients list if valid
                    }

                    // Construim URL-ul de tip mailto
                    let mailtoLink = 'mailto:' + emailDestinatar + '?subject=' + encodeURIComponent(subiect) + '&body=' + encodeURIComponent(corpEmail);

                    // Deschidem clientul de email implicit
                    window.location.href = mailtoLink;

                } catch (e) {
                    console.error("Eroare la primirea răspunsului JSON:", e);
                    alert("A apărut o eroare primirea răspunsului.");
                }
            },
            onerror: function(response) {
                console.log("Eroare la trimiterea datelor:", response);
                alert("A apărut o eroare la trimiterea datelor.");
            }
        });
    }

})();
