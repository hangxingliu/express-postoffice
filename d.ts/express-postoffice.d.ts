/// <reference types="express" />
/// <reference types="serve-static" />

import * as serveStatic from "serve-static";
import * as express from "express";

declare interface ExpressPostOfficeCore extends express.Express{
	
	addModule(as: string, module?: string|PostOfficeAddModuleOption): ExpressPostOfficeCore;

	addAsCommon(asCommonName: string, ...handler: Array<Handler>): ExpressPostOfficeCore;

	useCommon(...commonNames: string): ExpressPostOfficeCore;	
	
	_getCommon(commonName: string): Handler;

	resolve(): ExpressPostOfficeCore;

} 
declare interface PostOfficeAddModuleOption {
	name: string;
	method: string;
	args: any;
}

declare interface PostOfficeAction extends Handler {
	/**
	 * name for debug
	 */
	name?: string;
	method?: string;
	path?: string;
	before?: string | Handler | Array<string|Handler>;
}

declare interface PostOfficeControllerExport {
	/**
	 * name for debug
	 */
	name?: string;
	path?: string;
	before?: string | Handler | Array<string|Handler>;
	views?: string;
	engine?: string;
	actions: Map<string, PostOfficeAction> | Array<PostOfficeAction>;
	_default?: string | PostOfficeAction;
}
declare type PostOfficeCommonExport = Map<string, Handler|Array<Handler>>;

declare interface PostOfficeOptions {
	base: string;
	controllers?: "controllers"|string|Array<string>;
	common?: "controllers/common"|string|Array<string>;
	views?: "views";
	engine?: string;
}

declare function postoffice(opts: PostOfficeOptions): ExpressPostOfficeCore;
declare namespace postoffice{
	export var static: typeof serveStatic;
	export function exportController(opt: PostOfficeControllerExport): PostOfficeControllerExport;

	/**
	 * @description This method it is not exists!
	 * @deprecated
	 * @param actionFn 
	 */
	export function __createAction(actionFn: Handler): PostOfficeAction;
}

export = postoffice;

/* from express */

type ErrorHandler = ((err: Error, req: express.Request, res: express.Response, next: NextFunction) => any);
type Handler = ((req: express.Request, res: express.Response, next: NextFunction) => any);

interface NextFunction {
    (err?: any): void;
}