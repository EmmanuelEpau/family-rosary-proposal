(() => {
 'use strict';
 const archive = document.querySelector('.fr-legacy-archive');
 if (!archive) return;

 const offices = [...archive.querySelectorAll('[data-fr-office]')];
 if (offices.length) {
  const label = document.createElement('label');
  label.className = 'fr-legacy-office-filter';
  label.textContent = 'Country';
  const select = document.createElement('select');
  select.append(new Option('All countries', ''));
  const countries = [...new Set(offices.map(office => office.dataset.frOffice))].sort();
  for (const country of countries) select.append(new Option(country, country));
  label.append(select);
  offices[0].parentElement.before(label);
  select.addEventListener('change', () => {
   for (const office of offices) office.hidden = Boolean(select.value && office.dataset.frOffice !== select.value);
  });
 }

 const mediaHosts = new Set(['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'www.podbean.com', 'fast.wistia.net', 'app.hubspot.com']);
 archive.addEventListener('click', event => {
  const link = event.target.closest('a[data-fr-legacy-embed]');
  if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const source = new URL(link.href);
  if (source.protocol !== 'https:' || !mediaHosts.has(source.hostname)) return;
  event.preventDefault();
  if (link.nextElementSibling?.classList.contains('fr-legacy-player')) {
   link.nextElementSibling.focus();
   return;
  }
  archive.querySelector('.fr-legacy-player')?.remove();
  source.searchParams.set('autoplay', '1');
  const player = document.createElement('iframe');
  player.className = 'fr-legacy-player';
  player.title = link.textContent.trim();
  player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  player.allowFullscreen = true;
  player.src = source.href;
  link.after(player);
 });

 function loadScript(url) {
  return new Promise((resolve, reject) => {
   const script = document.createElement('script');
   script.src = url;
   script.async = true;
   script.onload = resolve;
   script.onerror = reject;
   document.head.append(script);
  });
 }

 const forms = [...archive.querySelectorAll('[data-fr-form]')].filter(form => /^[a-f0-9-]{36}$/.test(form.dataset.frForm));
 const unavailable = form => {
  form.textContent = 'This form could not load. Reload the page to try again.';
  form.setAttribute('role', 'status');
 };
 const v2 = forms.filter(form => form.dataset.frFormVersion === '2');
 if (v2.length) {
  loadScript('https://js.hsforms.net/forms/v2.js').then(() => {
   for (const [index, form] of v2.entries()) {
    form.id = 'fr-retained-form-' + index;
    window.hbspt.forms.create({region:'na1', portalId:'275132', formId:form.dataset.frForm, target:'#' + form.id});
   }
  }).catch(() => v2.forEach(unavailable));
 }
 const v4 = forms.filter(form => form.dataset.frFormVersion === '4');
 if (v4.length) {
  for (const form of v4) {
   form.classList.add('hs-form-frame');
   form.dataset.region = 'na1';
   form.dataset.portalId = '275132';
   form.dataset.formId = form.dataset.frForm;
  }
  loadScript('https://js.hsforms.net/forms/embed/275132.js').catch(() => v4.forEach(unavailable));
 }
})();
