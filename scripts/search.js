export const search = {
  compile: (pattern, caseInsensitive = true) => {
    try { return new RegExp(pattern, caseInsensitive ? 'gi' : 'g'); } 
    catch (e) { throw new Error(`Invalid regex: ${e.message}`); }
  },
  highlight: (text, regex) => {
    if (!regex) return text;
    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(regex, match => `<mark>${match}</mark>`);
  },
  filter: (records, regex) => {
    if (!regex) return records;
    return records.filter(r => {
      const searchStr = `${r.description} ${r.category} ${r.date} ${r.amount}`;
      regex.lastIndex = 0;
      return regex.test(searchStr);
    });
  }
};