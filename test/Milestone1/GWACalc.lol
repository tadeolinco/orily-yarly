HAI 1.2
I HAS A total_units ITZ 0
I HAS A grade
I HAS A units
I HAS A temp
I HAS A gwa ITZ 0

VISIBLE "GWA Calculator"
VISIBLE "Enter number of subjects: "
GIMMEH num

BTW loop asking for the grade and corresponding units for each subject

    VISIBLE "Enter grade: "
    GIMMEH grade

    VISIBLE "Enter units: "
    GIMMEH units

    total_units R SUM OF total_units AN units
    temp R PRODUKT OF grade AN units
    gwa R SUM OF gwa AN temp

    VISIBLE "Enter grade: "
    GIMMEH grade

    VISIBLE "Enter units: "
    GIMMEH units

    total_units R SUM OF total_units AN units
    temp R PRODUKT OF grade AN units
    gwa R SUM OF gwa AN temp


gwa R QUOSHUNT OF gwa AN total_units
VISIBLE gwa
KTHXBYE
