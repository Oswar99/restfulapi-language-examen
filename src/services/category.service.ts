import {Request,Response} from "express";

import {Category, ICategory} from "../models/category.model";
import {LanguageService} from "../services/language.service";

import { MongooseDocument } from "mongoose";
import { Language } from "../models/language.model";


export class CategoryHelpers{

    public GetCategory(filter: any):Promise<ICategory>{        
        return new Promise<ICategory>( (resolve) => {
            Category.find(filter,(err:Error,category:ICategory)=>{
                if(err){
                    console.log(err);
                }else{
                    resolve(category);
                }
            }); 
        });
    }
}


export class CategoryService extends CategoryHelpers{
    
    public async getOneCat(req: Request, res: Response){
        const c: any = await super.GetCategory({_id: req.params.id})
        if (c === undefined){
            res.status(401).json({});
        }else{
            res.status(200).json(c);
        }
    }

    public getAll(req:Request, res:Response){
        Category.find({},(err:Error, categories: MongooseDocument)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(categories);
            }
            
        });
    }

    public getAllWLanguage(req:Request, res:Response){

        Category.aggregate([{
            "$lookup":{
                from: "languages",
                localField:"_id",
                foreignField:"category",
                as: "l"
            }
        }],(err:Error,data:any)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(data);
            }
        })

    }

    public async NewOne(req: Request, res: Response){        
        const c = new Category(req.body);
        const old_cat:any = await super.GetCategory({name:c.name});

        if( old_cat.length === 0 ){
            await c.save((err:Error, category: ICategory)=>{
                if(err){
                    res.status(401).send(err);
                }else{
                    res.status(200).json( category? {successed:true, category: category } : {successed:false} );
                }            
            });
        }else{
            res.status(200).json({successed:false});
        }        

    }

    public async deleteOne(req: Request, res: Response){
        const language_service: LanguageService = new LanguageService();
        const languages:any = await language_service.GetLanguage({category: req.params.id});

        if( languages.length > 0 ){
            res.status(200).json({successed:false});
        }else{

            Category.findByIdAndDelete(req.params.id,(err:Error)=>{
                if(err){
                    res.status(401).send({successed:false});
                }else{
                    res.status(200).json({successed:true});
                }
            });

        }

    }  

    public async getLanguageByCategory(req:Request, res:Response){
        const c: any = await super.GetCategory({_id: req.params.id});

        Language.find({category: c},(err:Error, categories: MongooseDocument)=>{
            if(err){
                res.status(401).send(err);
            }else{
                res.status(200).json(categories);
            }
            
        });
    } 
    
}