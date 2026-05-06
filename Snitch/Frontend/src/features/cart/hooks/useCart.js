import { useDispatch,useSelector } from "react-redux";
import { addItem, getCart } from "../service/cart.api.js";
import { addItem as addItemToCart, setItems} from "../state/cart.slice.js";


export const useCart = ()=>{
    const dispatch = useDispatch();

     async function handleAddItem({ productId, variantId }) {
        const data = await addItem({ productId, variantId })

        return data
    }

    async function handleGetCart(){
        const data = await getCart();
        dispatch(setItems(data.cart.items));
        
    }


    return{
        handleAddItem,
        handleGetCart
    }

}
