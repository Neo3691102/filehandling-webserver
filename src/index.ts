import * as http from 'http';
import * as fs from 'fs';

const requestListener: http.RequestListener = (req, response) => {

    
    if ((req.url === '/notes' || req.url === '/') && req.method === 'GET') { //PETICION GET
        console.log("Petición GET recibida!");

        const path = "./src/notes.json";
        fs.readFile(path, "utf8", (err, content) => {
            if (err) {
                console.error(err);
                response.writeHead(500, { "Content-Type": "text/plain" });
                response.end("Error al leer el archivo");
                return;
            }

            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(content);
        });
    }else if(req.url === '/notes' && req.method === 'POST'){ //PETICION POST
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // convierte Buffer a string
        });
        req.on('end', () => {
            const newNote = JSON.parse(body);
            const path = "./src/notes.json";
    
            fs.readFile(path, "utf8", (err, content) => {
                if (err) {
                    console.error(err);
                    response.writeHead(500, { "Content-Type": "text/plain" });
                    response.end("Error al leer el archivo");
                    return;
                }
    
                const notes: { id: number, content: string }[] = JSON.parse(content);
                const id = Math.max(...notes.map((note: { id: number }) => note.id), 0) + 1;
                const updatedNote = { id, content: newNote.content };
                notes.push(updatedNote);
    
                fs.writeFile(path, JSON.stringify(notes, null, 2), err => {
                    if (err) {
                        console.error(err);
                        response.writeHead(500, { "Content-Type": "text/plain" });
                        response.end("Error al escribir en el archivo");
                        return;
                    }
    
                    response.writeHead(201, { "Content-Type": "application/json" });
                    response.end(JSON.stringify(updatedNote));
                });
            });
        });
    }

    //para traer nota por su id
    if (req.url?.startsWith('/notes/') && req.method === 'GET') {
        console.log("Petición GET recibida!");
    
        const match = req.url.match(/\/notes\/(\d+)$/);
        if (match) {
            const id = parseInt(match[1]);
            const path = "./src/notes.json";
    
            fs.readFile(path, "utf8", (err, content) => {
                if (err) {
                    console.error(err);
                    response.writeHead(500, { "Content-Type": "text/plain" });
                    response.end("Error al leer el archivo");
                    return;
                }
            
                const notes: { id: number, content: string }[] = JSON.parse(content);
                const note = notes.find((note: { id: number, content: string }) => note.id === id);
            
                if (note) {
                    response.writeHead(200, { "Content-Type": "application/json" });
                    response.end(JSON.stringify(note));
                } else {
                    response.writeHead(404, { "Content-Type": "text/plain" });
                    response.end("Nota no encontrada");
                }
            });
        }
    }


   
}




const server = http.createServer(requestListener);
 server.listen(5500);