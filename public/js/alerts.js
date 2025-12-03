/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, msg) => {
  hideAlert();
  const markeup = `<div class="alert alert--${type}">${msg}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markeup);
  window.setTimeout(hideAlert, 5000);
};
