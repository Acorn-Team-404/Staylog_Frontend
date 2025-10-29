// createStore로 alias 설정
import { legacy_createStore as createStore, type Store } from 'redux' // 
import type { AppAction, RootState } from './types';
import reducer from './reducer';

// store는 RootState에 맞는 상태를 가지며, AppAction에 맞는 action만 받는다.
const store: Store<RootState, AppAction> = createStore(reducer);

// dispatch 시 반환값을 AppDispatch로 지정해서 사용할 수 있도록 export
export type AppDispatch = typeof store.dispatch;

export default store