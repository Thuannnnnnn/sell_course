import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';

interface AddVideoProps {
    show: boolean;
    handleClose: () => void;
    refreshVideos: () => void;
}

const AddVideo: React.FC<AddVideoProps> = ({ show, handleClose, refreshVideos }) => {
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddVideo = async () => {
        setLoading(true);
        try {
            await axios.post('/api/videos', { title, url });
            refreshVideos();
            handleClose();
        } catch (error) {
            console.error('Error adding video:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Video</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formVideoTitle">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter video title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formVideoUrl">
                        <Form.Label>URL</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter video URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleAddVideo} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Video'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddVideo;