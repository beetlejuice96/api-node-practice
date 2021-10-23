import { Query,Resolver } from "type-graphql";

@Resolver()
export class BookResolver{

    @Query(()=>String)
    getAll(){
        return 'All my books';
    }
}