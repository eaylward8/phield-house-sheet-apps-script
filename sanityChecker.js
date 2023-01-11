class SanityChecker {
  static check() {
    const sheetName = SheetNames.signUp;

    if (Finder.findContent(sheetName, 'A6') !== '#1') return false;
    if (Finder.findContent(sheetName, 'I19') !== '#14') return false;
    if (Finder.findContent(sheetName, 'C31') !== '#10') return false;
    if (Finder.findContent(sheetName, 'G22') !== '#1') return false;

    return true;
  }
}
