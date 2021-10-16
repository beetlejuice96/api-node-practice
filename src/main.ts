import {startServer} from  './server';

const main = async() => {
    const port:number=4000;
    const app = await startServer();
    app.listen(port);
    console.log(`app running on port ${port}` )
}

main();