import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  getBills = () => {
    if (this.store) {
      return this.store
        .bills()
        .list()
        .then(snapshot => {
          // Tri des factures par date du plus récent au plus ancien
          const sortedBills = snapshot.sort((a, b) => {
            // Gestion des cas où la date est null
            if (a.date === null) return 1; // Place `a` après si `a.date` est null
            if (b.date === null) return -1; // Place `b` après si `b.date` est null

            // Tri inversé
            return b.date.localeCompare(a.date); // Inversion des arguments pour trier du plus récent au plus ancien
          });

          // Formatage des dates et des statuts de chaque facture
          const bills = sortedBills.map(doc => {
            try {
              return {
                ...doc,
                date: doc.date ? formatDate(doc.date) : 'N/A',
                status: formatStatus(doc.status)
              }
            } catch (e) {
              console.log(e, 'for', doc);
              return {
                ...doc,
                date: doc.date ? formatDate(doc.date) : 'N/A',
                status: formatStatus(doc.status)
              }
            }
          });

          return bills;
        });

        
    }
  }
}

function sortBillsByDate(bills) {
  const months = ["Jan.", "Fév.", "Mar.", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."];

  // Conversion des dates au format ISO pour le tri
  const convertDateToDate = (dateStr) => {
    const parts = dateStr.split(' ');
    const day = parts[0];
    const monthPart = parts[1];
    const yearPart = parts[2];
    const month = months.indexOf(monthPart) + 1; // Convertit l'index du mois en nombre (commence à 1)
    const year = parseInt(yearPart, 10) < 70 ? `20${yearPart}` : `19${yearPart}`;
    return `${year}-${month.toString().padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  // Tri des factures du plus ancien au plus récent
  return bills.sort((a, b) => {
    const dateA = convertDateToDate(a.date);
    const dateB = convertDateToDate(b.date);
    if (dateA < dateB) {
      return -1; // Maintenant, cela place 'a' avant 'b' si 'a' est plus ancien
    } else if (dateA > dateB) {
      return 1; // Et cela place 'a' après 'b' si 'a' est plus récent
    } else {
      // En cas d'égalité des dates, tri secondaire par ID pour garder un ordre consistant
      return a.id.localeCompare(b.id);
    }
  });
}

/*
return this.store
        .bills()
        .list()
        .then(snapshot => {
          // Tri des factures par date du plus ancien au plus récent
          const sortedBills = snapshot.sort((a, b) => {
            // Gestion des cas où la date est null
            if (a.date === null) return 1; // Place `a` après si `a.date` est null
            if (b.date === null) return -1; // Place `b` après si `b.date` est null

            // Tri normal
            return a.date.localeCompare(b.date); // Inversion des arguments pour trier du plus ancien au plus récent
          });

          // Formatage des dates et des statuts de chaque facture
          const bills = sortedBills.map(doc => {
            try {
              return {
                ...doc,
                date: doc.date ? formatDate(doc.date) : 'N/A',
                status: formatStatus(doc.status)
              }
            } catch (e) {
              console.log(e, 'for', doc);
              return {
                ...doc,
                date: doc.date ? formatDate(doc.date) : 'N/A',
                status: formatStatus(doc.status)
              }
            }
          });

          return bills;
        });
*/


