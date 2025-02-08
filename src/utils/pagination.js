export const paginationFunction = ({ page = 1, size = 2 }) => {
    // the required params
    if (page < 1) page = 1
    if (size < 1) size = 2


    // equations
    // 10 products => page = 3, size = 2
    const limit = +size
    const skip = (+page - 1) * limit


    return { limit, skip }
}


