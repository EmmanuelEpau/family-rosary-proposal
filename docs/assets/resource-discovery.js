(() => {
  const form = document.querySelector('#rd-filters');
  if (!form) return;
  const cards = [...document.querySelectorAll('.rd-resource')];
  const keys = ['q', 'topic', 'format', 'language', 'view'];
  const fields = Object.fromEntries(keys.map(key => [key, form.elements.namedItem(key)]));
  const count = document.querySelector('#rd-count');
  const more = document.querySelector('#rd-more');
  const notice = document.querySelector('#rd-notice');
  const localization = window.frLocalization;
  const translate = message => localization?.messages?.[message] ?? message;
  const number = new Intl.NumberFormat(localization?.locale || 'en');
  let limit = 12;
  let matches = [];
  const normalized = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  const topicLabels = new Map([...fields.topic.options].map(option => [
    option.value, [option.textContent, option.getAttribute('data-search-label')].filter(Boolean).join(' '),
  ]));
  const searchable = card => normalized([card.textContent, ...(card.dataset.topics || '').split(' ').map(topic => topicLabels.get(topic) || topic.replaceAll('-', ' '))].join(' '));
  const read = () => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const topic = [...fields.topic.options].find(option => option.getAttribute('data-search-label') === query);
    fields.q.value = topic?.textContent || query;
    keys.slice(1).forEach(key => {
      const value = params.get(key);
      fields[key].value = [...fields[key].options].some(option => option.value === value) ? value : '';
    });
  };
  const save = () => {
    const next = new URL(location.href);
    keys.forEach(key => fields[key].value ? next.searchParams.set(key, fields[key].value) : next.searchParams.delete(key));
    history.replaceState(null, '', next);
  };
  const render = () => {
    const term = normalized(fields.q.value.trim());
    const active = keys.slice(1).filter(key => fields[key].value);
    const summary = form.querySelector('.rd-filter-details summary');
    if (summary) summary.textContent = active.length
      ? translate('Filters') + ' · ' + active.map(key => fields[key].selectedOptions[0].textContent).join(' · ')
      : translate('Filter resources');
    matches = cards.filter(card => (!term || searchable(card).includes(term)) &&
      ['topic', 'format', 'language', 'view'].every(key => !fields[key].value ||
        (card.dataset[key === 'topic' ? 'topics' : key] || (key === 'language' ? 'unknown' : '')).split(' ').includes(fields[key].value)));
    const shown = new Set(matches.slice(0, limit));
    cards.forEach(card => { card.hidden = !shown.has(card); });
    count.textContent = translate('Showing {shown} of {total} resources')
      .replace('{shown}', number.format(Math.min(limit, matches.length)))
      .replace('{total}', number.format(matches.length));
    document.querySelector('#rd-empty').hidden = matches.length > 0;
    const remaining = Math.max(0, matches.length - limit);
    more.hidden = remaining === 0;
    more.textContent = translate('Show {next} more ({remaining} remaining)')
      .replace('{next}', number.format(Math.min(12, remaining)))
      .replace('{remaining}', number.format(remaining));
  };
  const revealHash = (focus = false) => {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = cards.find(card => card.id === id);
    if (!target) return;
    if (!matches.includes(target)) {
      keys.forEach(key => { fields[key].value = ''; });
      notice.textContent = translate('Filters cleared to show the resource you opened.');
      notice.hidden = false;
      save();
      render();
    }
    limit = Math.max(limit, Math.ceil((matches.indexOf(target) + 1) / 12) * 12);
    render();
    requestAnimationFrame(() => {
      target.scrollIntoView({block: 'start'});
      if (focus) target.focus({preventScroll: true});
    });
  };
  const update = () => { limit = 12; notice.hidden = true; render(); save(); };
  form.hidden = false;
  read();
  render();
  revealHash();
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => { event.preventDefault(); update(); });
  form.addEventListener('reset', () => { setTimeout(update, 0); });
  document.querySelector('#rd-empty-reset').addEventListener('click', () => { form.reset(); fields.q.focus(); });
  more.addEventListener('click', () => {
    const next = matches[limit];
    limit += 12;
    render();
    next?.focus({preventScroll: true});
  });
  window.addEventListener('hashchange', () => revealHash(true));
  window.addEventListener('popstate', () => { read(); limit = 12; render(); revealHash(); });
})();
