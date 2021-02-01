var app = {
    backend: 'http://localhost:8888/api/libros',
    backendEditoriales: 'http://localhost:8888/api/editoriales',
    backendAutores: 'http://localhost:8888/api/autores',
    table : null,
    selectEditoriales : null,
    selectAutores : null,
    jsonEditoriales : null,
    jsonAutores : null,
    init: function() {
        app.initDatatable('#libros');
        app.initSelectEditoriales();
        app.initSelectAutores();

        $("#save").click(function(){
            app.save({
                id: $('#idEntity').val(),
                titulo: $('#titulo').val(),
                year: $('#year').val(),
                genero: $('#genero').val(),
                numeroPaginas: $('#numeroPaginas').val(),
                editorial: {id: app.selectEditoriales.val()},
                autor: {id: app.selectAutores.val()}
            });
        });

    },
    initSelectAutores: function(){
        app.selectAutores = $('#autor');

        $.ajax({
            url: app.backendAutores + '/listar-autores',
            type: 'GET',
            async: true,
            contentType: "application/json; charset=utf-8",
            success : function(json) {
                app.jsonAutores = json;
                app.selectAutores.find('option').remove();
                app.selectAutores.append('<option value="0">Seleccione</option>');

                json.forEach(element => {
                    app.selectAutores.append('<option value="' + element.id +'">' + element.nombreCompleto +'</option>');
                });

            },
            error : function(error) {
                app.selectAutores.find('option').remove();
                app.selectAutores.append('<option value="0">Sin registros</option>');
            }
        })

    },
    initSelectEditoriales: function(){
        app.selectEditoriales = $('#editorial');

        $.ajax({
            url: app.backendEditoriales + '/listar-editoriales',
            type: 'GET',
            async: true,
            contentType: "application/json; charset=utf-8",
            success : function(json) {
                app.jsonEditoriales = json;
                app.selectEditoriales.find('option').remove();
                app.selectEditoriales.append('<option value="0">Seleccione</option>');

                json.forEach(element => {
                    app.selectEditoriales.append('<option value="' + element.id +'">' + element.nombre +'</option>');
                });

            },
            error : function(error) {
                app.selectEditoriales.find('option').remove();
                app.selectEditoriales.append('<option value="0">Sin registros</option>');
            }
        })

    },
    initDatatable : function(id) {
        app.table = $(id).DataTable({
            ajax : {
                url : app.backend + '/listar-libros',
                dataSrc : function(json) {
                    return json;
                }
            },
            "language": {
                "url": "http://cdn.datatables.net/plug-ins/1.10.16/i18n/Spanish.json"
            },
            dom: 'Bfrtip',
            columns : [
                {data : "id"},
                {data : "titulo"},
                {data : "year"},
                {data : "genero"},
                {data : "numeroPaginas"},
                {data : "autor.nombreCompleto"},
                {data : "editorial.nombre"}
            ],
            buttons: [
                {
                    text: 'Crear',
                    action: function(e, dt, node, config){
                        app.cleanForm();
                        app.initSelectAutores();
                        app.initSelectEditoriales;
                        $('#libroModal').modal();
                    }
                },
                {
                    text : 'Editar',
                    action : function(e, dt, node, config) {
                        var data = dt.rows('.table-active').data()[0];
                        app.setDataToModal(data);
                        //app.initSelectAutores();
                        //app.initSelectEditoriales;

                        $('#autor option[value="'+ data.autor.id +'"]').attr("selected", true);
                        $('#editorial option[value="'+ data.editorial.id +'"]').attr("selected", true);
                        

                        $('#libroModal').modal();
                    }
                },
                {
                    text : 'Eliminar',
                    action : function(e, dt, node, config) {
                        var data = dt.rows('.table-active').data()[0];
                        if(confirm('¿Está seguro de ELIMINAR el libro' + data.titulo+ '?')) {
                            app.delete(data.id);
                        }
                    }
                }
            ]
        });

        $('#libros tbody').on('click', 'tr', function(){
            if ($(this).hasClass('table-active')) {
                $(this).removeClass('table-active');
            } else {
                app.table.$('tr.table-active').removeClass('table-active');
                $(this).addClass('table-active');
            }
        });
    },
    setDataToModal : function(data) {
        $('#idEntity').val(data.id);
        $('#titulo').val(data.titulo);
        $('#year').val(data.year);
        $('#genero').val(data.genero);
        $('#numeroPaginas').val(data.numeroPaginas);
    },
    cleanForm : function(){
        $('#idEntity').val('');
        $('#titulo').val('');
        $('#year').val('');
        $('#genero').val('');
        $('#numeroPaginas').val('');
    },
    save : function(data) {
        $.ajax({
            url: app.backend + '/guardar-libro',
            data : JSON.stringify(data),
            method: 'PUT',
            dataType : 'json',
            contentType: "application/json; charset=utf-8",
            success : function(json) {
                $("#msg").text('Se guardó el libro correctamente');
                app.mostrarMensaje("#msg");
                $('#libroModal').modal('hide');
                app.table.ajax.reload();
            },
            error : function(error) {

            }
        })
    },
    delete : function(id) {
        $.ajax({
            url: app.backend + '/eliminar-libro/' + id,
            method: 'DELETE',
            dataType : 'json',
            contentType: "application/json; charset=utf-8",
            success : function(json) {
                $("#msg").text('Se eliminó el libro correctamente');
                app.mostrarMensaje("#msg");
                app.table.ajax.reload();
            },
            error : function(error) {

            }
        })
    },
    mostrarMensaje : function(selector){
        setTimeout(function() {
            $(selector).show();
        },1000);
        
        setTimeout(function() {
            $(selector).hide();
        },8000);
    }
};

$(document).ready(function(){
    app.init();
});