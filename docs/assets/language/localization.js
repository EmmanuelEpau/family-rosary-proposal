(() => {
 'use strict';
 const config = window.frLocalization;
 if (!config) return;
 const attrs = ['alt', 'aria-label', 'placeholder', 'title'];
 const ignored = 'script, style, template, [data-fr-language-link], [contenteditable]';
 const englishPrayer = '#prayer-words, .fr-follow-words';
 const translate = value => {
  const key = value.replace(/\s+/gu, ' ').trim();
  return Object.hasOwn(config.messages, key) ? config.messages[key] : value;
 };
 config.translate = translate;

 document.querySelector('.fr-language')?.addEventListener('click', event => {
  const link = event.target.closest('a[data-fr-language-link]');
  if (link) {
   const current = new URL(location.href);
   const destination = new URL(link.href);
   const search = current.searchParams.get('q');
   if (search) {
    const normalized = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase();
    const topics = document.querySelectorAll('#rd-topic option[data-search-label]');
    const topic = [...topics].find(option => normalized(option.textContent) === normalized(search));
    if (topic) current.searchParams.set('q', topic.dataset.searchLabel);
   }
   for (const key of ['article', 'document', 'episode', 'q', 'topic', 'format', 'section', 'language', 'view', 'age']) {
    const value = current.searchParams.get(key);
    if (value !== null && value.length <= 160) destination.searchParams.set(key, value);
    else destination.searchParams.delete(key);
   }
   destination.hash = current.hash;
   link.href = destination.href;
  }
 });

 if (config.language === 'en') return;
 const translateText = node => {
  if (node.parentElement?.closest(ignored)) return;
  const source = node.nodeValue;
  const translated = translate(source);
  if (translated !== source) {
   const [, left, right] = source.match(/^(\s*).*?(\s*)$/su);
   node.nodeValue = left + translated + right;
  }
 };
 const translateAttributes = element => {
  if (element.closest(ignored)) return;
  for (const attr of attrs) {
   const source = element.getAttribute(attr);
   if (source === null) continue;
   const translated = translate(source);
   if (translated !== source) element.setAttribute(attr, translated);
  }
 };
 const localize = node => {
  if (node.nodeType === Node.TEXT_NODE) {
   translateText(node);
  } else if (node.nodeType === Node.ELEMENT_NODE && !node.closest(ignored)) {
   if (node.matches(englishPrayer)) node.lang = 'en';
   node.querySelectorAll(englishPrayer).forEach(prayer => { prayer.lang = 'en'; });
   const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
   for (let child = walker.nextNode(); child; child = walker.nextNode()) translateText(child);
   translateAttributes(node);
   node.querySelectorAll('[aria-label],[alt],[placeholder],[title]').forEach(translateAttributes);
  }
 };
 const initialize = () => {
  const date = document.querySelector('[data-today-date]');
  if (date) date.textContent = new Date().toLocaleDateString(config.locale, {weekday:'long', month:'long', day:'numeric'});
  localize(document.body);
  new MutationObserver(records => records.forEach(record => {
   if (record.type === 'attributes') {
    translateAttributes(record.target);
   } else if (record.type === 'characterData') {
    translateText(record.target);
   } else {
    record.addedNodes.forEach(localize);
   }
  })).observe(document.body, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:attrs});
 };
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, {once:true});
 else initialize();
})();
