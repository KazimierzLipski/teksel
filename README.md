# excel-in-type

Projekt na przedmiot TKOM.

Język arkuszowy w TypeScript.

- Arkusze kalkulacyjne
- W TypeScript

## Opis projektu

Zamysłem projektu będzie stworzyć język programowania arkuszowego z dodanym edytorem kodu.

## Support

email: kazimierz.lipski.stud@pw.edu.pl

## Autorzy

Kazimierz Lipski <br>
Konsultant: p. Piotr Gawkowski

## Status projektu

W trakcie realizacji

# Projekt wstępny

## Zwięzła analiza wymagań funkcjonalnych i niefunkcjonalnych

- Ustalenie wartości dla każdej komórki - Każda komórka powinnam móc mieć jakąś wartość, liczbową lub tekstową
- Operacje zbiorcze na komórkach - Powinno się móc aggregować komórki poprzez np. sumę.
- Generator wizualny programu - Wgrywany kod powinien generować wizualną reprezentację swoich obliczeń

### Operatory

```
= + += - -= != == > < >= <= * /
```

### Typy danych

```
int float string

pole -> wartość, typ, kolumna, wiersz
zakres -> poleStartowe:poleKońcowe
```

### Instrukcje warunkowe

```
if condition value1 else value2
```

### Pętle

```
foreach cell in range
{

}
```

### Agregatory

```
sum(range) count(range)
```

### Operacje na łańcuchach

```
trim(cell) mid(cell, indexFrom, chars)
```

### Komentarze

```
# Komentarze będą poprzedzone hashem
```

## Przykłady obrazujące dopuszczalne konstrukcje językowe oraz ich semantykę.

### Suma zakresu

```
sum(range)
{
    let sum = 0;
    foreach cell in range
    {
       sum += cell.value;
    }
    return sum;
}

main()
{
    B2 = 7;
    B10 = 43;
    B11 = sum(B1:B10);
    # B11 should equal 50
}
```

### Selekcja

```
main()
{
    B1 = 43;
    B2 = if B1>0 10 else 54
    # B2 should be 54
}
```

### Zliczanie

```
count(range)
{
    let count = 0;
    foreach cell in range
    {
       count += if cell.value!=null 1 else 0
    }
    return count;
}

main()
{
    B3 = 1;
    B5 = 10;
    B10 = 100;
    B11 = count(B1:B10);
    # B11 should be equal to 3
}
```

### Obcinanie

```
trim(cell)
{
    let newCell = "";
    let spaces = 0;
    foreach letter in cell
    {
      spaces += if letter==" " 1 else -spaces
      newCell += if spaces<=1 letter else ""
    }
    return newCell;
}

main()
{
    A1 = "Hello          World";
    A2 = trim(A1);
    # A2 should be equal to "Hello World"
}
```

### Wycinanie

```
mid(cell, indexFrom, chars)
{
    let newCell = "";
    let count = 0;
    let tempNewLetter = "";
    foreach letter in cell
    {
      count += 1;
      tempNewLetter = if count>=indexFrom letter else "";
      newCell += if indexFrom+chars<count tempNewLetter else "";
    }
    return newCell;
}

main()
{
    A1 = "Would you like some crisps?";
    A2 = mid(A1, 7, 3);
    # A2 should be equal to "you"
}
```

## Gramatyka

```
program = { functionDefinition };
parametersList = referent, {",", referent};
functionDefinition = identifier, "(", [parametersList], ")", block;
functionCall = identifier, "(", [parametersList], ")";
block = "{", {statement}, "}";
statement = assignment | conditionalStatement | identifier | returnStatement;
returnStatement = "return", referent;
conditionalStatement = ifStatement | forEachStatement;
ifStatement = "if", referent, block, {"else", block};
forEachStatement = "foreach", identifier, "in", referent, block;
assignment = identifier ("=" | "+=" | "-="), referent;
referent = expression | (expression, (">" | "<" | ">=" | "<=" | "==" | "!="), expression);
expression = term, {("+" | "-"), term};
term = factor, {{"*" | "/"}, factor};
factor = integer | float | text | identifier | functionCall | "(", referent, ")";
text = "\"", {char}, "\"";
identifier = letter, {char | "_"};
float = integer, ".", digit, {digit};
integer = "0" | (nonZeroDigit, {digit});
char = letter | digit;
letter = lowerLetter | upperLetter;
lowerLetter = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";
upperLetter = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
digit = "0" | nonZeroDigit;
nonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
```

## Obsługa błędów (jakiego rodzaju błędy będą wykrywane, tolerowane?, jak będzie wyglądał przykładowy komunikat o błędzie?).

Błędy związane:
Pole, które do którego jest przypisywana błędna wartość, będzie wyświetlać komunikat błędu:

```
#ERROR
```

Pola korzystające z błędnego pola będą miały warstość

```
#BADCELLREF
```

## Sposób uruchomienia, wej./wyj.

Będzie to aplikacja webowa, która przyjmuje input tekstowy i po wciśnięciu przycisku "Generate" wygeneruje tabelę wyników

## Zwięzły opis sposobu testowania

Do testów posłużą mi biblioteka Jest oferująca testy jednostkowe każdej części aplikacji. Dzięki tej bibliotece będę mógł przetestować zarówno analizator leksykalny jak i składniowy.
