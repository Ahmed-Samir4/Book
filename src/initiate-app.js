import { gracefulShutdown } from "node-schedule"
import db_connection from "../DB/connection.js"
import { globalResponse } from "./middlewares/global-response.middleware.js"
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-documnets.middleware.js"
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js"

import * as  routers from './modules/index.routes.js'
// import { cronToChangeExpiredCoupons } from "./utils/crons.js"


export const initiateApp = (app, express) => {

    const port = process.env.PORT


    app.use(express.json())

    db_connection()

    app.use('/auth', routers.authRouter)
    app.use('/user', routers.userRouter)
    app.use('/category', routers.categoryRouter)
    app.use('/book', routers.bookRouter)
    app.use('/review', routers.reviewRouter)

    app.use('*', (req, res, next) => {
        res.status(404).json({ message: 'Not found' })
    })

    app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments)



    // cronToChangeExpiredCoupons()
    // gracefulShutdown()

    app.get('/', (req, res) => res.send('Hello World!'))
    app.listen(port, () => console.log(`Example app listening on port ${port}!`))

}