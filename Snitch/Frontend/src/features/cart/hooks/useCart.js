import { useDispatch,useSelector } from "react-redux";
import { addItem, getCart, incrementCartItemApi } from "../service/cart.api.js";
import { addItem as addItemToCart, increamentCartItem, setItems} from "../state/cart.slice.js";


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

    async function handleIncrementItem({productId,variantId}){
        // Optimistic UI Update: Update Redux immediately so the UI feels instant!
        dispatch(increamentCartItem({productId, variantId}));
        
        try {
            // Then fire the API call in the background
            await incrementCartItemApi({productId,variantId});
        } catch (error) {
            console.error("Failed to update cart on server", error);
            // If it fails, you would ideally revert the change here
        }
    }


    return{
        handleAddItem,
        handleGetCart,
        handleIncrementItem,
    }

}
