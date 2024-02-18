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
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
          console.log('bills: ', bills)
          console.log('length', bills.length)
        const sortedBills = sortBillsByDate(bills);
        console.log(sortedBills)
        return sortedBills
      })
    }
  }
}


function convertDate(convDate) {
  const months = {
    Jan: '01', Fév: '02', Mar: '03', Avr: '04', Mai: '05', Juin: '06',
    Juil: '07', Août: '08', Sep: '09', Oct: '10', Nov: '11', Déc: '12'
  };
  // Supposons que convDate soit du format "22 Fév. 21" avec un espace après le point
  const parts = convDate.split(' ');
  const day = parts[0];
  // Retire le point et les espaces potentiels pour correspondre à la clé du dictionnaire
  const monthKey = parts[1].replace('.', '').trim(); // Retire le point et les espaces potentiels
  const month = months[monthKey];

  let yearSuffix = parts[2];
  const currentYearSuffix = new Date().getFullYear().toString().slice(-2);

  let century = '20';
  if (parseInt(yearSuffix) > parseInt(currentYearSuffix)) {
    century = '19';
  }
  const year = century + yearSuffix;

  console.log(`${year}-${month}-${day}`);
  return new Date(`${year}-${month}-${day}`);
}


function sortBillsByDate(bills) {
  return bills.sort((a, b) => {
    const dateA = convertDate(a.date);
    const dateB = convertDate(b.date);
    return dateB - dateA; // Tri décroissant
  });
}
