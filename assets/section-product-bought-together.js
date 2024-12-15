if (!customElements.get('bought-together')) {
    customElements.define('bought-together', class BoughtTogether extends HTMLElement {
      constructor() {
        super();
        this.button = null;
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      }

      connectedCallback() {
        this.setupListeners();
      }

      setupListeners() {
        this.observer = new MutationObserver(() => this.observeButton());
        this.observer.observe(this, { childList: true, subtree: true });
      }

      observeButton() {
        const button = this.querySelector('.sec-BoughtTogether__submitButton');
        if (button) {
          button.addEventListener('click', (e) => this.handleButtonClick(e));
          this.observer.disconnect();
        }
      }

      handleButtonClick(e) {
        const button = e.target;
        const currentProductId = button.getAttribute('data-primary-variant-id');
        const secondProductId = button.getAttribute('data-secondary-variant-id');

        button.setAttribute('aria-disabled', true);
        this.querySelector('.loading-overlay__spinner').classList.remove('hidden');

        const items = [
          {
              id: parseInt(currentProductId, 10),
              quantity: 1
          },
          {
              id: parseInt(secondProductId, 10),
              quantity: 1
          }
        ];


        const payload = {
          items: items
        };

        if (this.cart) {
            payload.sections = this.cart.getSectionsToRender().map((section) => section.id);
            payload.sections_url = window.location.pathname;
            this.cart.setActiveElement(document.activeElement);
        }

        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        };

      fetch('/cart/add.js', config)
        .then(response => response.json())
        .then(data => {
            console.log('Items added to cart:', data);
            if (this.cart) {
              if (data.sections) {
                  this.cart.renderContents(data);
              } else {
                  console.error('No sections data in response');
              }
          }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
          button.setAttribute('aria-disabled', false);
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          button.setAttribute('aria-disabled', false);
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
      }
    });
}
