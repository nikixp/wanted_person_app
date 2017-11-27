$(document).ready(function () {
    //променлива, която ще приема стойност на клонирания формуляр за татуировки
    let clonedSelectForm = "";
    //задаване на събитие при кликане на елемент от блока с особености
    $('.osobenosti > div').on('click', function () {
        $(this).toggleClass('active');//добавяне или премахане на клас актив
        //проверка дали кликнатия елемент те татуйровка
        if ($(this).data('value') === 'tattoo') {
            $('.all-tattoo-info').toggle(1000);
            //проверка дали xml данните са били заредени или това е първото отваряне
            if ($(this).data('isloaded') == 0) {
                //извикване на функцията за построяване на селект полетата
                getElementsFromXMLtoSelect('_Tatoo.xml', '.tattoo-type');
                getElementsFromXMLtoSelect('_Belezi_myasto.xml', '.tattoo-location');
                getElementsFromXMLtoSelect('_Belezi_posoka.xml', '.tattoo-direction');
                //при свършване на заявките за xml да се направи копие на формуляра
                $(document).ajaxStop(function () {
                    //копираме състоянието на формуляра за татуировки и го 
                    //предаваме на променливата clonedSelectForm
                    clonedSelectForm = createSelectCloning();
                    //активиране на select2.js библиотеката
                    $('.select2js').select2();
                    //добавяме в текущия елемент, че данните вече са заредини и да не 
                    //повтаря тази процедура повече
                    $(this).data('isloaded', 1);
                });
            }
        }
    });

    //клониране на елементит от блока с полета за татуировки
    $('#add-new-tattoo-field').on('click', function () {
        //оригиналния шаблон на формуляра го клонираме в нова променлива
        //ако използваме директно шаблона, то с него може да създадем само един нов елемент
        //клонирайки го всеки път създаваме ново копие на шаблона
        let newSelectForm = $(clonedSelectForm).clone();
        //залачаме новото копие към контейнера, който съдържа всички формуляри с татуировки
        $('.select2js', newSelectForm).select2();
        //активираме select2 библиотеката върху текущите селект елементи на копието
        $(newSelectForm).appendTo('.tattoo-container');
    });

    //при кликване на х за изтриване на елемент
    $('.tattoo-container').on('click', '.close-tattoo', function () {
        $(this).parent().remove();
    });

    //при изпращане на данните
    $('#send-form').on('click', function () {
        //нулиране на класовете за грешки
        $('.red-border').removeClass('red-border');
        $('.errors').text("").hide();
        $('.single-error').remove();
        //вземаме данните от потребителските полета
        let firstName = $('#firstname').val();
        let lastName = $('#lastname').val();
        let EGN = $('#egn').val();
        let data = {};//обект в който ще съхраняваме данните
        let error = false;

        //валидираме дали полето не е празно
        if (firstName == "") {
            $('.errors').append('<span>Попълнете полето "Име"</span><br>').show();
            $('#firstname').addClass('red-border');
            error = true;
        }

        //валидираме дали полето не е празно
        if (lastName == "") {
            $('.errors').append('<span>Попълнете полето "Фамилия"</span><br>').show();
            $('#lastname').addClass('red-border');
            error = true;
        }

        //валидираме дали полето не е празно
        if (EGN == "") {
            $('.errors').append('<span>Попълнете полето "ЕГН"</span><br>').show();
            $('#egn').addClass('red-border');
            error = true;
        }

        //валидираме дали полето е само с цифри
        if (!$.isNumeric(EGN)) {
            $('.errors').append('<span>ЕГН-то може да съдържа само цифри</span><br>').show();
            $('#egn').addClass('red-border');
            error = true;
        }

        if (error) {
            scrollToSelector('.errors');
        }

        if (!validateNameField(firstName, '#firstname', /[a-zA-Z0-9]/ig)) {
            return false;
        }

        if (!validateNameField(lastName, '#lastname', /[a-zA-Z0-9]/ig)) {
            return false;
        }

        if (!checkEGN('#egn')) {
            return false;
        }
        //тъпчене на данните в масива
        data.firstname = firstName;
        data.lastname = lastName;
        data.egn = EGN;

        //взимаме белезите
        let belezi = [];
        let tattArr = [];
        let tattoOK = true;
        $('.osobenosti .active').each(function () {
            belezi.push($(this).data('value'));
        });
        //проверяваме далив текутщите белези има татуировки
        if (belezi.indexOf('tattoo') !== -1) {
            //преминаваме през цикъм през всеки един формулят от татуировки
            $('.single-tattoo').each(function () {
                //вземаме данните за татуировките
                let tattooLocation = $('.tattoo-location', this).val();
                let tattooDirection = $('.tattoo-direction', this).val();
                let tattooType = $('.tattoo-type', this).val();
                let description = $('.tattoo-descript').val();

                //Проверка дали всички данни са попълнени
                if (!checkSelect($('.tattoo-location', this), tattooLocation) ||
                        !checkSelect($('.tattoo-direction', this), tattooDirection) ||
                        !checkSelect($('.tattoo-type', this), tattooType)) {
                    tattoOK = false;
                }
                //добавяме към масива за данни за татуировките обект с инфо за татуировки
                tattArr.push({
                    location: tattooLocation,
                    direction: tattooDirection,
                    type: tattooType,
                    desc: description
                });
            });
        }
        //Проверяваме показателя за грешка при събиране на данни 
        //от формуляра за татуировки
        if (tattoOK === true) {
            data.tattoo = tattArr;
            //подаваме данните към sessionStorage
            //sessionStorage.tattooData = JSON.stringify(data);
            //зареждаме друга страница
            //window.location.href = 'tattoData.html';

            //#niki edit
            try {
                //ako iskame novo id
                //var newKey = db.database().ref().child('wanted_persons').push().key;
                //console.log('new key is ' + newKey);
                let result = db.database().ref('wanted_persons/').push({data});
                console.log('data is saved with at ' + result)
                console.log('alldata: https://mvr-bg-b97eb.firebaseio.com/wanted_persons.json');
            } catch (err) {
                console.error(err);
            }
        }

    });


    $('.tattoo-container').on('change', '.select2js ', function () {
        if ($(this).val() !== "") {
            $(this).next().removeClass('red-border');
        } else {
            $(this).next().addClass('red-border');
        }
    })
    //Извикване на AJAX заявка 
    $('#ajaxContent').on('click', function () {

        $.ajax({
            url: 'https://jsonplaceholder.typicode.com/photos', //линк към ресурса
            data: {bla: "test"}, // данни, които изпращаме
            dataType: 'json', // данни, които очакваме да получим
            type: 'GET', // тип на заявката
            success: function (data) { // фунцкия, която да се изпълни при успех
                console.log((data));
                for (let element of data) {
                    $('<h2>').text(element.title).appendTo('.useless-info');
                }
            },
            error: function (error) {// фунцкия, която да се изпълни при грешка
                console.log(error);
            }
        });
    });

    //Функция за добавяне на option & optgroup елементи от XML обект(файл)
    function getElementsFromXMLtoSelect(pathToXML, selectSelector) {
        //извикваме файла
        $.get(pathToXML, function (data, result) {
            //проверка дали е зареден успешно
            if (result === 'success') {
                //намираме елемент root и неговите деца и започваме цикъл в тях
                $(data).find('root').children().each(function () {
                    //проверяваме дали децата на root имат собствени деца
                    //ако това е така - значи имам две нива и трябва да използваме optgroup
                    if ($(this).children().length > 0) {
                        //създаваме елемент, добавяме му атрибут и текст и го закачаме към селектора
                        $('<optgroup>', {
                            cod_z: $(this).attr('cod_z'),
                            label: $(this).attr('ime_z').replace(/^[.]/, '')//с replace изчистваме всички . използвайки regular expresion
                        }).appendTo(selectSelector);
                        //създаваме елемент, добавяме му атрибут и текст и го закачаме към селектора
                        $(this).children().each(function () {
                            $('<option>', {
                                value: $(this).attr('cod_z')
                            }).text($(this).attr('ime_z')).appendTo(selectSelector);
                        });

                    }
                    //при липсва на второ ниво просто създаваме option елементи
                    else {
                        //създаваме елемент, добавяме му атрибут и текст и го закачаме към селектора
                        $('<option>', {
                            value: $(this).attr('cod_z')
                        }).text($(this).attr('ime_z')).appendTo(selectSelector);
                    }
                });
            }
        }).fail(function (err) {
            //при грешка на зареждането на XML файла да изпълни този код
            alert('Оп, грешка при зареждане на XML файла!');
        });

    }

    //функция за създаване на шаблон от формата за татуйровки
    function createSelectCloning() {
        //копираме първия елемент
        let cloning = $('#tattoo1').clone();//клониране на основния елемент
        $(cloning).removeAttr('id');//премахване на атринут id
        //  създаване на нов елемент
        let deleteElement = $('<input>', {
            type: 'button',
            value: 'x',
            class: 'close-tattoo'
        }).appendTo(cloning);
        //връщаме новосъздадения шаблон
        return cloning;
    }

    function scrollToSelector(selector, addSize = 0) {
        //addSize = addSize || 0;
        $('html').animate({
            scrollTop: $(selector).offset().top - addSize
        }, 1000);
    }

    function validateNameField(string, selector, regex) {
        if (string.match(regex)) {
            $(selector).parent().before('<span class="single-error">Невалидно име!</span><br>');
            $(selector).addClass('red-border').focus();
            scrollToSelector(selector, 50);
            return false;
        }
        return true;
    }

    function checkEGN(selector) {
        let arrayOfEGN = $(selector).val().split("");

        if (arrayOfEGN.length != 10) {
            $(selector).parent().before('<span class="single-error">ЕГН трябва да е от 10 цифри!</span><br>');
            scrollToSelector(selector, 50);
            return false;
        }

        if (isNaN($(selector).val())) {
            $(selector).parent().before('<span class="single-error">ЕГН трябва да е от цифри!</span><br>');
            scrollToSelector(selector, 50);
            return false;
        }

        return true;
    }

    function checkSelect(jQSelector, value) {
        if (value === "") {
            jQSelector.next().addClass('red-border');
            return false;
        }
        return true;
    }
    //събитие стартиращо функция при изпращане на ajax заявка
    $(document).ajaxSend(function (event, request, settings) {
        //проверка дали в текущия ajax имаме зареждане на xml
        if (settings.url.indexOf('xml') !== -1) {
            $('.mask').show();
        }
    });

    //събитие при свършаване на всяка ajax заявка
    $(document).ajaxStop(function () {
        $('.mask').hide();
    });

});