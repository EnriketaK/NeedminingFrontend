import { Routes } from '@angular/router';
import { ButtonDemo } from './buttondemo';
import { ChartDemo } from './chartdemo';
import { FileDemo } from './filedemo';
import { FormLayoutDemo } from './formlayoutdemo';
import { InputDemo } from './inputdemo';
import { ListDemo } from './listdemo';
import { MediaDemo } from './mediademo';
import { MessagesDemo } from './messagesdemo';
import { MiscDemo } from './miscdemo';
import { PanelsDemo } from './panelsdemo';
import { TimelineDemo } from './timelinedemo';
import { TableDemo } from './tabledemo';
import { OverlayDemo } from './overlaydemo';
import { TreeDemo } from './treedemo';
import { MenuDemo } from './menudemo';
import { PostsPage } from '@/pages/uikit/postspage';
import { UploadPage } from '@/pages/uikit/uploadpage';
import { NeedsPage } from '@/pages/uikit/needspage';
import { PostDetail } from '@/pages/uikit/postdetail';
import { CategoriesPage } from '@/pages/uikit/categoriespage';
import { ChartsPage } from '@/pages/uikit/chartspage';

export default [
    { path: 'posts', data: { breadcrumb: 'Posts' }, component: PostsPage },
    { path: 'needs', data: { breadcrumb: 'Needs' }, component: NeedsPage },
    { path: 'postdetail/:id', data: { breadcrumb: 'PostDetail' }, component: PostDetail },
    { path: 'categories', data: { breadcrumb: 'Categories' }, component: CategoriesPage },
    { path: 'charts', data: { breadcrumb: 'Charts' }, component: ChartsPage },
    { path: 'upload', data: { breadcrumb: 'Upload' }, component: UploadPage },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
