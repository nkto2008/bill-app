/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

// Début d'un groupe de tests décrivant un scénario spécifique : un employé connecté naviguant sur la page des factures.
describe("Given I am connected as an employee", () => {
  // Sous-groupe de tests pour le contexte spécifique où l'utilisateur accède à la page des factures.
  describe("When I navigate to the Bills page", () => {
    // Le test proprement dit vérifie que les factures sont récupérées et triées par date.
    test("Then bills should be fetched and sorted by date", async () => {
      // Création d'un mock pour la fonction de navigation.
      const onNavigate = jest.fn();
      // Simulation d'un store qui retourne une promesse résolue avec les factures mockées.
      const store = {
        bills: () => ({
          list: () => Promise.resolve(bills)
        })
      };
      // Instanciation du composant Bills avec les mocks nécessaires.
      const billsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage
      });
      // Appel de la méthode `getBills` et attente de son résultat.
      const fetchedBills = await billsInstance.getBills();
      // Vérification que le nombre de factures récupérées correspond au nombre attendu.
      expect(fetchedBills.length).toBe(bills.length);
      // Vérification que les factures sont triées par date du plus récent au plus ancien.
      const sortedByDate = fetchedBills.every((bill, i, arr) => !i || arr[i - 1].date >= bill.date);
      // Confirmation que les factures sont bien triées.
      expect(sortedByDate).toBe(true);
    });
  });
});

// Test vérifiant le comportement lorsque l'utilisateur clique sur l'icône œil pour visualiser une facture.
test("handleClickIconEye should display the modal with the bill image", () => {
  // Injection HTML simulant la structure nécessaire pour le test dans le document.
  document.body.innerHTML = `
    <div data-testid="icon-eye" data-bill-url="http://example.com/bill.jpg"></div>
    <div id="modaleFile" class="modal"><div class="modal-body"></div></div>
  `;
  // Mock de la fonction modal de jQuery pour simuler son appel.
  $.fn.modal = jest.fn();
  // Instanciation du composant Bills sans les dépendances non utilisées dans ce test.
  const bills = new Bills({ document, onNavigate: null, store: null, localStorage: null });

  // Simulation du clic sur l'icône œil.
  const iconEye = screen.getByTestId("icon-eye");
  iconEye.click();
  // Vérification que la fonction modal a été appelée pour afficher le modal.
  expect($.fn.modal).toHaveBeenCalledWith('show');
  // Vérification que le contenu du modal contient l'image de la facture attendue.
  expect(document.querySelector(".modal-body").innerHTML).toContain("http://example.com/bill.jpg");
});

//GET BILLS

// Définition du contexte de test global pour un utilisateur connecté en tant qu'Employee
describe("Given I am a user connected as Employee", () => {

  // Description du scénario de test spécifique lors de la navigation vers la page des factures
  describe("When I navigate to Bills", () => {

    // Test pour vérifier la récupération et l'affichage des factures via un GET de l'API mockée
    test("fetches bills from mock API GET", async () => {
      // Configuration initiale : simulation de la connexion d'un utilisateur Employee
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "e@e.com" }));

      // Création et ajout d'un élément 'root' au DOM pour simuler la structure de la page
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // Initialisation du routeur et navigation vers la page des factures
      router();
      window.onNavigate(ROUTES_PATH.Bills);

      // Attente de l'affichage du bouton "Nouvelle note de frais" pour confirmer que la page est chargée
      await waitFor(() => screen.getByText("Nouvelle note de frais"));
      // Ici, vous pouvez ajouter des vérifications supplémentaires si nécessaire
    });

    // Scénarios de test pour simuler des erreurs lors de la récupération des factures depuis l'API
    describe("When an error occurs on API", () => {

      // Configuration qui s'applique avant chaque test d'erreur
      beforeEach(() => {
        // Mock du store pour simuler le comportement de l'API
        jest.spyOn(mockStore, "bills");

        // Configuration du localStorage mock pour simuler un utilisateur connecté
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: "e@e.com" }));

        // Ajout de l'élément 'root' au DOM
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);

        // Initialisation du routeur
        router();
      });

      // Test pour simuler une erreur 404 lors de la récupération des factures
      test("fetches bills from an API and fails with 404 message error", async () => {
        // Configuration du mock pour rejeter la promesse avec une erreur 404 lors de l'appel à list()
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            }
          };
        });

        // Simuler la navigation vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);

        // Attendre que l'erreur soit traitée
        await new Promise(process.nextTick);

        // Vérifier que le message d'erreur 404 est bien affiché à l'utilisateur
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      // Test similaire au précédent mais pour simuler une erreur 500
      test("fetches bills from an API and fails with 500 message error", async () => {
        // Configuration du mock pour rejeter la promesse avec une erreur 500 lors de l'appel à list()
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            }
          };
        });

        // Simuler la navigation vers la page des factures
        window.onNavigate(ROUTES_PATH.Bills);

        // Attendre que l'erreur soit traitée
        await new Promise(process.nextTick);

        // Vérifier que le message d'erreur 500 est bien affiché à l'utilisateur
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
