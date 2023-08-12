const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { dbConnection } = require('../database/config');

class Server {

    constructor() {
        this.app  = express();
        this.port = process.env.PORT;

        this.paths = {
            auth:       '/api/auth',
            buscar:     '/api/buscar',
            categorias: '/api/categorias',
            productos:  '/api/productos',
            usuarios:   '/api/usuarios',
            uploads:    '/api/uploads',
            mascotas:    '/api/mascotas',
            carritos:    '/api/carritos',
            citas:    '/api/citas',
            compras:    '/api/compras',
            servicios:    '/api/servicios',
            pagos:    '/api/pagos',
            planes:    '/api/planes',
            planesU:      '/api/planesU',


        }


        // Conectar a base de datos
        this.conectarDB();

        // Middlewares
        this.middlewares();

        // Rutas de mi aplicación
        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }


    middlewares() {

        // CORS
        this.app.use( cors() );

        // Lectura y parseo del body
        this.app.use( express.json() );

        // Directorio Público
        this.app.use( express.static('public') );

        // Fileupload - Carga de archivos
        this.app.use( fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));

    }

    routes() {
        
        this.app.use( this.paths.auth, require('../routes/auth'));
        this.app.use( this.paths.buscar, require('../routes/buscar'));
        this.app.use( this.paths.categorias, require('../routes/categorias'));
        this.app.use( this.paths.productos, require('../routes/productos'));
        this.app.use( this.paths.usuarios, require('../routes/usuarios'));
        this.app.use( this.paths.uploads, require('../routes/uploads'));
        this.app.use( this.paths.mascotas, require('../routes/mascotas'));
        this.app.use( this.paths.carritos, require('../routes/carritos'));
        this.app.use( this.paths.citas, require('../routes/citas'));
        this.app.use( this.paths.compras, require('../routes/compras'));
        this.app.use( this.paths.servicios, require('../routes/servicios'));
        this.app.use( this.paths.pagos, require('../routes/pagos'));
        this.app.use( this.paths.planes, require('../routes/planes'));
        this.app.use( this.paths.planesU, require('../routes/planesU'));

 
        
    }

    listen() {
        this.app.listen( this.port, () => {
            console.log('Servidor corriendo en puerto', this.port );
        });
    }

}




module.exports = Server;
