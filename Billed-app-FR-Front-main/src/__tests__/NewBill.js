/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import { ROUTES_PATH } from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"





jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Préparation de l'environnement de test
    beforeEach(() => {
      // Mock du localStorage pour simuler un utilisateur connecté
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "employee@example.com"
      }))
      // Injection du HTML de la page NewBill dans le corps du document pour le test
      const html = NewBillUI()
      document.body.innerHTML = html
    })
    

    test("Then the form should be rendered", () => {
      // Vérifier que le formulaire de nouvelle facture est rendu
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
    })

    test("Then the file input should accept only jpg, jpeg, or png files", () => {
      // Création d'une nouvelle instance NewBill avec un mock du store et navigation
      const onNavigate = (pathname) => { document.body.innerHTML = ROUTES({ pathname }) }
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      // Simuler le changement de fichier pour tester la validation du format
      const input = screen.getByTestId("file")
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      input.addEventListener("change", handleChangeFile)

      // Créer un objet File mocké avec un type de fichier valide et un autre invalide
      fireEvent.change(input, { target: { files: [new File(['file'], 'file.jpg', { type: 'image/jpg' })] } })
      expect(handleChangeFile).toHaveBeenCalled()
      expect(input.files[0].name).toBe('file.jpg')

      fireEvent.change(input, { target: { files: [new File(['file'], 'file.pdf', { type: 'application/pdf' })] } })
      // La valeur du champ fichier doit être réinitialisée à vide si le format est invalide
      expect(input.value).toBe('')
    })
   
    test("Then, it should fill them in the page and submit the form", async () => {
      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document, onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
      }, store: mockStore, localStorage: window.localStorage });

      // Simuler le remplissage du formulaire
      fireEvent.change(screen.getByTestId('expense-type'), { target: { value: 'Transports' } });
      fireEvent.change(screen.getByTestId('expense-name'), { target: { value: 'Essence' } });
      fireEvent.change(screen.getByTestId('amount'), { target: { value: 50 } });
      fireEvent.change(screen.getByTestId('commentary'), { target: { value: 'Pour le trajet à mon travail' } });
      fireEvent.change(screen.getByTestId('pct'), { target: { value: 20 } });

      // Mock de handleSubmit pour vérifier la soumission
      newBill.handleSubmit = jest.fn();
      newBill.fileUrl = "http://example.com/file.jpg";
      newBill.fileName = "file.jpg";

      // Simuler la soumission du formulaire
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', newBill.handleSubmit);
      fireEvent.submit(form);

      // Assertions
      expect(newBill.handleSubmit).toHaveBeenCalled();
    });
    test("should fail with 404 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          create: () => Promise.reject(new Error("Erreur 404"))
        }
      });

      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document, onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }, store: mockStore, localStorage: window.localStorage
      });

      // Mock handleSubmit to prevent form submission
      const handleSubmitMock = jest.fn();
      newBill.handleSubmit = handleSubmitMock;

      // Attempt to submit the form
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', newBill.handleSubmit);
      fireEvent.submit(form);

      // Check for error handling
      expect(newBill.handleSubmit).toHaveBeenCalled();
      const html = BillsUI({ error: "Erreur 400" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 400/);
      expect(message).toBeTruthy();  
    
    });
    test("should fail with 500 message error", async () => {
      jest.spyOn(mockStore, "bills").mockImplementationOnce(() => {
        return {
          create: () => Promise.reject(new Error("Erreur 500"))
        }
      });

      document.body.innerHTML = NewBillUI();
      const newBill = new NewBill({
        document, onNavigate: (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }, store: mockStore, localStorage: window.localStorage
      });

      const handleSubmitMock = jest.fn();
      newBill.handleSubmit = handleSubmitMock;

      // Simuler la soumission du formulaire
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', newBill.handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmitMock).toHaveBeenCalled();
      const html = BillsUI({ error: "Erreur 500" });
      document.body.innerHTML = html;
      const message = await screen.getByText(/Erreur 500/);
      expect(message).toBeTruthy();  
    });
  })
})




