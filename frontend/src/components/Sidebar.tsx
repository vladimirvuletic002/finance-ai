import '../App.css';

const Sidebar = () => {

    const toggleSidebar = () => {
        const sidebar = document.getElementById("sidebarContent");
        sidebar?.classList.toggle('show');
    }

    return (
        <aside id="sidebar">  
            
            <div id='sidebarContent'>
                sidebar
            </div>

            <button className='showSidebar' onClick={() => toggleSidebar()}>
                ❮
            </button>

        </aside>
    )

};

export default Sidebar;